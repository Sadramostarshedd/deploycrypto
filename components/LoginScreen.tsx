
import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  Tabs, 
  Tab, 
  useDisclosure 
} from '@heroui/react';
import { UserPlus, AlertTriangle, ShieldCheck, Terminal, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase.ts';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<any>("login");
  const { onOpen } = useDisclosure();

  const handleTabChange = (key: any) => {
    setSelectedTab(key);
    setError(null);
  };

  const handleAuth = async (type: 'login' | 'signup') => {
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("PROTOCOL_ERR: KEY_LENGTH_MIN_6");
      setLoading(false);
      return;
    }

    try {
      if (type === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] }
          }
        });

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already registered')) {
            setError("IDENTITY_CONFLICT: ID_RESERVED");
          } else {
            throw signUpError;
          }
          return;
        }

        const userId = signUpData?.user?.id;
        if (userId) {
          await supabase.from('profiles').upsert({
            id: userId,
            username: username || email.split('@')[0],
            wins: 0,
            losses: 0,
            total_score: 0
          });
        }
        onLogin();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message?.toUpperCase().replace(/\s/g, '_') || 'LINK_FAILURE');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = {
    label: "text-[9px] font-black text-green-500/70 tracking-[0.3em] mb-2 uppercase",
    input: "text-slate-100 font-mono text-sm placeholder:text-slate-800",
    inputWrapper: [
      "bg-slate-950/60",
      "border",
      "border-slate-800/80",
      "rounded-none",
      "px-4",
      "transition-all",
      "h-12",
      "shadow-none",
      "after:hidden",
      "before:hidden",
      "data-[hover=true]:border-green-900/50",
      "group-data-[focus=true]:border-green-500",
      "group-data-[focus=true]:bg-slate-900",
    ].join(" ")
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden bg-[#020617] cyber-grid fixed inset-0">
      {/* Tactical UI Decor */}
      <div className="absolute top-10 left-10 w-24 h-24 border-t border-l border-slate-800/50 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border-b border-r border-slate-800/50 pointer-events-none" />
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-4 opacity-10">
        {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-green-500 rounded-full" />)}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] flex flex-col gap-8 z-10 px-6"
      >
        {/* Branding Cluster */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-green-500/50" />
            <ShieldCheck size={24} className="text-green-500" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-green-500/50" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none uppercase">
            ARENA<span className="text-green-500">.</span>ONE
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-green-500 font-black tracking-[0.4em] uppercase">Status: Secure_Link</span>
          </div>
        </div>

        {/* Tactical Terminal Card */}
        <Card className="w-full bg-slate-950/40 border-2 border-slate-800 rounded-none shadow-2xl backdrop-blur-md overflow-visible">
          {/* Corner Brackets on Card */}
          <div className="absolute -top-[2px] -left-[2px] w-4 h-4 border-t-2 border-l-2 border-green-500 z-20" />
          <div className="absolute -bottom-[2px] -right-[2px] w-4 h-4 border-b-2 border-r-2 border-green-500 z-20" />
          
          <CardBody className="p-8 flex flex-col gap-0 overflow-visible">
            <Tabs
              fullWidth
              variant="underlined"
              color="success"
              selectedKey={selectedTab}
              onSelectionChange={handleTabChange}
              classNames={{
                tabList: "p-0 border-b border-slate-800/50 mb-10 gap-0",
                tab: "font-black tracking-[0.3em] uppercase text-[10px] h-12 px-0",
                cursor: "bg-green-500 h-[2px]",
                tabContent: "group-data-[selected=true]:text-green-400 text-slate-500 transition-colors",
                panel: "p-0 overflow-visible"
              }}
            >
              <Tab
                key="login"
                title={
                  <div className="flex items-center gap-2">
                    <Terminal size={12} />
                    <span>UPLINK</span>
                  </div>
                }
              >
                <form className="flex flex-col gap-10" onSubmit={(e) => { e.preventDefault(); handleAuth('login'); }}>
                  <div className="space-y-8">
                    <Input
                      label="OPERATOR_ID"
                      value={email}
                      onValueChange={setEmail}
                      variant="flat"
                      labelPlacement="outside"
                      placeholder="ENTER EMAIL"
                      classNames={inputClasses}
                    />
                    <Input
                      label="ACCESS_KEY"
                      type="password"
                      value={password}
                      onValueChange={setPassword}
                      variant="flat"
                      labelPlacement="outside"
                      placeholder="••••••••"
                      classNames={inputClasses}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="p-3 border-l-2 border-red-500 bg-red-950/10 flex items-center gap-3"
                        >
                          <AlertTriangle size={14} className="text-red-500 shrink-0" />
                          <p className="text-red-500 text-[9px] uppercase font-black tracking-widest">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      isLoading={loading}
                      type="submit"
                      className="h-14 bg-green-500 text-black text-lg font-black uppercase tracking-[0.4em] rounded-none hover:bg-green-400 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    >
                      ENGAGE
                    </Button>
                    <button
                      type="button"
                      onClick={onOpen}
                      className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] hover:text-green-500 transition-colors"
                    >
                      [PROTOCOL_DOCUMENTATION]
                    </button>
                  </div>
                </form>
              </Tab>

              <Tab
                key="signup"
                title={
                  <div className="flex items-center gap-2">
                    <UserPlus size={12} />
                    <span>ENROLL</span>
                  </div>
                }
              >
                <form className="flex flex-col gap-10" onSubmit={(e) => { e.preventDefault(); handleAuth('signup'); }}>
                  <div className="space-y-6">
                    <Input
                      label="NETWORK_EMAIL"
                      value={email}
                      onValueChange={setEmail}
                      variant="flat"
                      labelPlacement="outside"
                      placeholder="USER@DOMAIN.COM"
                      classNames={inputClasses}
                    />
                    <Input
                      label="CALLSIGN"
                      value={username}
                      onValueChange={setUsername}
                      variant="flat"
                      labelPlacement="outside"
                      placeholder="OPERATOR_NAME"
                      classNames={inputClasses}
                    />
                    <Input
                      label="SECURE_KEY"
                      type="password"
                      value={password}
                      onValueChange={setPassword}
                      variant="flat"
                      labelPlacement="outside"
                      placeholder="••••••••"
                      classNames={inputClasses}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 border-l-2 border-red-500 bg-red-950/10 flex items-center gap-3"
                        >
                          <AlertTriangle size={14} className="text-red-500 shrink-0" />
                          <p className="text-red-500 text-[9px] uppercase font-black tracking-widest">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      isLoading={loading}
                      type="submit"
                      className="h-14 bg-white text-black text-lg font-black uppercase tracking-[0.4em] rounded-none hover:bg-slate-200 active:scale-[0.98] transition-all"
                    >
                      REGISTER
                    </Button>
                  </div>
                </form>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* Footer Metrics */}
        <div className="flex flex-col gap-4 opacity-40">
          <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase font-black tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <Globe size={10} /> 
              <span>Node: US_EAST_01</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={10} />
              <span>Thread: 0x4f2a</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
          <p className="text-center text-[7px] text-slate-700 font-bold tracking-[0.6em] uppercase">
            Encrypted End-To-End // No Data Persistence
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
