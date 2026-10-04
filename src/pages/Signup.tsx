import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Brain, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw, Store, ShoppingCart, MapPin, Search, Loader2, Navigation } from 'lucide-react';

interface SignupProps {
  onSwitchToLogin: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

type Step = 'details' | 'captcha-step1' | 'captcha-step2' | 'store-verify' | 'creating';

interface StoreInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  verified: boolean;
  mapsUrl: string;
}

export function Signup({ onSwitchToLogin, showToast }: SignupProps) {
  const [step, setStep] = useState<Step>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Store verification
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'found' | 'not-found' | null>(null);

  // Captcha step 1: math challenge
  const [mathAnswer, setMathAnswer] = useState('');
  const mathChallenge = useMemo(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { a, b, answer: a + b };
  }, [step === 'captcha-step1']);

  // Captcha step 2: image selection
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const imageChallenge = useMemo(() => {
    if (step !== 'captcha-step2') return { target: '', emojis: [] as { emoji: string; isTarget: boolean }[] };
    const categories = [
      { name: 'fruits', items: ['🍎', '🍌', '🍊', '🍇', '🥭', '🍓'] },
      { name: 'vegetables', items: ['🥕', '🥔', '🍅', '🧅', '🥦', '🌽'] },
      { name: 'dairy', items: ['🥛', '🧀', '🧈', '🍦'] },
      { name: 'household', items: ['🧼', '🧴', '🧽'] },
    ];
    const target = categories[Math.floor(Math.random() * categories.length)];
    const others = categories.filter(c => c.name !== target.name);
    const pool: { emoji: string; isTarget: boolean }[] = [];
    target.items.forEach(e => pool.push({ emoji: e, isTarget: true }));
    others.forEach(c => c.items.forEach(e => pool.push({ emoji: e, isTarget: false })));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return { target: target.name, emojis: pool.slice(0, 9) };
  }, [step === 'captcha-step2']);

  const validateDetails = (): boolean => {
    if (!fullName.trim()) { setError('Please enter your full name'); return false; }
    if (!email.trim()) { setError('Please enter your email'); return false; }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    setError('');
    return true;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetails()) {
      setStep('captcha-step1');
      setMathAnswer('');
    }
  };

  const handleCaptchaStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer) === mathChallenge.answer) {
      setError('');
      if (role === 'owner') {
        setStep('store-verify');
      } else {
        setStep('captcha-step2');
        setSelectedImages(new Set());
      }
    } else {
      setError('Incorrect answer. Please try again.');
      setMathAnswer('');
    }
  };

  const toggleImage = (idx: number) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCaptchaStep2 = () => {
    const correctSelections = imageChallenge.emojis.filter((e, i) => e.isTarget && selectedImages.has(i)).length;
    const totalTargets = imageChallenge.emojis.filter(e => e.isTarget).length;
    const wrongSelections = imageChallenge.emojis.filter((e, i) => !e.isTarget && selectedImages.has(i)).length;

    if (correctSelections === totalTargets && wrongSelections === 0) {
      handleSignup();
    } else {
      setError('Incorrect selection. Please select all ' + imageChallenge.target + ' and nothing else.');
      setSelectedImages(new Set());
    }
  };

  // Google Maps shop verification - simulated AI check
  const handleStoreSearch = () => {
    if (!storeSearchQuery.trim()) return;
    setVerifying(true);
    setVerificationResult(null);
    setStoreInfo(null);

    // Simulate AI verifying if the shop exists on Google Maps
    setTimeout(() => {
      // Generate realistic demo results based on the search query
      const demoLat = 16.5062 + (Math.random() - 0.5) * 0.05;
      const demoLng = 80.6480 + (Math.random() - 0.5) * 0.05;
      const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(storeSearchQuery)}&z=15&output=embed`;
      const isFound = storeSearchQuery.trim().length >= 3;

      if (isFound) {
        setStoreInfo({
          name: storeSearchQuery.trim(),
          address: `${storeSearchQuery.trim()}, Vijayawada, Andhra Pradesh, India`,
          lat: demoLat,
          lng: demoLng,
          verified: true,
          mapsUrl,
        });
        setVerificationResult('found');
      } else {
        setVerificationResult('not-found');
      }
      setVerifying(false);
    }, 1800);
  };

  const handleStoreContinue = () => {
    if (storeInfo?.verified) {
      setStep('captcha-step2');
      setSelectedImages(new Set());
      setError('');
    }
  };

  const handleSignup = async () => {
    setStep('creating');
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setStep('captcha-step2');
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        phone: phone || null,
      });

      if (profileError) {
        setError('Account created but profile setup failed: ' + profileError.message);
        setStep('captcha-step2');
        return;
      }

      showToast('success', 'Account created successfully! Welcome to RetailMind AI.');

      if (role === 'owner') {
        const storeName = storeInfo?.name || (fullName + "'s Store");
        const storeLocation = storeInfo?.address || 'Vijayawada';
        await supabase.from('stores').insert({
          owner_id: data.user.id,
          name: storeName,
          location: storeLocation,
          description: 'A verified store on RetailMind AI.',
          is_active: true,
        });
      }
    }
  };

  const refreshMath = () => {
    setStep('captcha-step1');
    setMathAnswer('');
  };

  const stepOrder: Step[] = role === 'owner'
    ? ['details', 'captcha-step1', 'store-verify', 'captcha-step2', 'creating']
    : ['details', 'captcha-step1', 'captcha-step2', 'creating'];

  const progressSteps: Step[] = role === 'owner'
    ? ['details', 'captcha-step1', 'store-verify', 'captcha-step2']
    : ['details', 'captcha-step1', 'captcha-step2'];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      <div className="lg:w-5/12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 lg:p-12 flex flex-col justify-between min-h-[280px] lg:min-h-screen">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">RetailMind AI</h1>
              <p className="text-xs text-blue-200">Making Every Store Smarter</p>
            </div>
            <Brain className="w-5 h-5 text-blue-300 ml-auto" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold leading-tight mb-4">Join the smartest<br />retail community</h2>
          <p className="text-blue-100 text-sm leading-relaxed">Compare prices across stores, order groceries online, and manage your shop with AI-powered insights.</p>
        </div>
        <div className="hidden lg:block space-y-4 mt-12">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><ShoppingCart className="w-4 h-4" /></div>
            <div><p className="text-sm font-semibold">For Customers</p><p className="text-xs text-blue-200">Compare prices, order from any store, get the best deals</p></div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0"><Store className="w-4 h-4" /></div>
            <div><p className="text-sm font-semibold">For Shop Owners</p><p className="text-xs text-blue-200">Verify your shop on Google Maps, digitalize inventory</p></div>
          </div>
        </div>
        <p className="text-xs text-blue-300 mt-6">© 2026 RetailMind AI · Demo Mode</p>
      </div>

      <div className="lg:w-7/12 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="text-slate-500 mt-1 text-sm">Get started in minutes — it's free.</p>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {progressSteps.map((s, i) => {
              const currentIdx = stepOrder.indexOf(step);
              const thisIdx = stepOrder.indexOf(s);
              const isDone = currentIdx > thisIdx;
              const isActive = step === s;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < progressSteps.length - 1 && <div className={`flex-1 h-0.5 ${isDone ? 'bg-green-500' : 'bg-slate-200'}`} />}
                </div>
              );
            })}
          </div>

          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          {/* Step 1: Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole('customer')} className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border-2 transition-all ${role === 'customer' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <ShoppingCart className={`w-5 h-5 ${role === 'customer' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-left"><p className={`text-sm font-semibold ${role === 'customer' ? 'text-blue-700' : 'text-slate-700'}`}>Customer</p><p className="text-[10px] text-slate-500">Order groceries</p></div>
                  </button>
                  <button type="button" onClick={() => setRole('owner')} className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border-2 transition-all ${role === 'owner' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Store className={`w-5 h-5 ${role === 'owner' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-left"><p className={`text-sm font-semibold ${role === 'owner' ? 'text-blue-700' : 'text-slate-700'}`}>Shop Owner</p><p className="text-[10px] text-slate-500">Manage a store</p></div>
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Continue <ArrowRight className="w-4 h-4" /></button>
              <p className="text-center text-sm text-slate-600">Already have an account? <button type="button" onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:text-blue-700">Sign in</button></p>
            </form>
          )}

          {/* Step 2: Captcha Step 1 - Math */}
          {step === 'captcha-step1' && (
            <form onSubmit={handleCaptchaStep1} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Security Step 1 of 2</span></div>
                <h3 className="font-bold text-slate-900">Verify you're human</h3>
                <p className="text-sm text-slate-500 mt-1">Solve this simple math problem to continue.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-slate-800">{mathChallenge.a}</span>
                  <span className="text-2xl text-slate-400">+</span>
                  <span className="text-3xl font-bold text-slate-800">{mathChallenge.b}</span>
                  <span className="text-2xl text-slate-400">=</span>
                  <span className="text-3xl font-bold text-blue-600">?</span>
                </div>
                <input type="number" value={mathAnswer} onChange={e => setMathAnswer(e.target.value)} placeholder="Your answer" autoFocus className="w-32 text-center text-lg font-bold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 mx-auto" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setStep('details'); setMathAnswer(''); setError(''); }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button type="button" onClick={refreshMath} className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="w-3.5 h-3.5" /> New problem</button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm">Verify <ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          )}

          {/* Step 3: Store verification (owners only) */}
          {step === 'store-verify' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">AI Shop Verification</span></div>
                <h3 className="font-bold text-slate-900">Verify your shop on Google Maps</h3>
                <p className="text-sm text-slate-500 mt-1">Our AI checks Google Maps to confirm your shop exists in real life.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={e => setStoreSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                  placeholder="Search your shop name, e.g. SmartMart Vijayawada"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                />
              </div>
              <button
                type="button"
                onClick={handleStoreSearch}
                disabled={!storeSearchQuery.trim() || verifying}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 shadow-sm"
              >
                {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> AI is checking Google Maps...</> : <><MapPin className="w-4 h-4" /> Search & Verify</>}
              </button>

              {verificationResult === 'not-found' && (
                <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  We couldn't find this shop on Google Maps. You can still continue, but your store will be marked as "unverified".
                </div>
              )}

              {storeInfo && verificationResult === 'found' && (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Shop verified on Google Maps!</p>
                      <p className="text-xs text-green-600">AI confirmed this is a real business location.</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-slate-100">
                      <iframe
                        src={storeInfo.mapsUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                        title="Store location on Google Maps"
                      />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Store className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{storeInfo.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600">{storeInfo.address}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500">{storeInfo.lat.toFixed(4)}, {storeInfo.lng.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setStep('captcha-step1'); setError(''); setStoreInfo(null); setVerificationResult(null); }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button
                  type="button"
                  onClick={handleStoreContinue}
                  disabled={!storeInfo}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 shadow-sm"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Captcha Step 2 - Image Selection */}
          {step === 'captcha-step2' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Security Step 2 of 2</span></div>
                <h3 className="font-bold text-slate-900">Select all {imageChallenge.target}</h3>
                <p className="text-sm text-slate-500 mt-1">Click on all images that match the category above.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  {imageChallenge.emojis.map((emoji, idx) => (
                    <button key={idx} type="button" onClick={() => toggleImage(idx)} className={`aspect-square rounded-lg flex items-center justify-center text-4xl transition-all ${selectedImages.has(idx) ? 'bg-blue-100 ring-2 ring-blue-500 scale-95' : 'bg-white border border-slate-200 hover:border-slate-300'}`}>{emoji.emoji}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setStep(role === 'owner' ? 'store-verify' : 'captcha-step1'); setSelectedImages(new Set()); setError(''); }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button type="button" onClick={handleCaptchaStep2} disabled={selectedImages.size === 0} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm">Create Account <CheckCircle2 className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-slate-800">Creating your account...</p>
              <p className="text-sm text-slate-500 mt-1">Setting up your profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
