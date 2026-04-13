"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  ChevronDown, 
  ChevronLeft,
  Check,
  CreditCard,
  MessageCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import FlowHeader from "@/components/FlowHeader";
import PhoneInput from "@/components/PhoneInput";
import Footer from "@/components/Footer";

const SignupPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0: Details, 1: Payment, 2: Confirmation
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isWorkStatusOpen, setIsWorkStatusOpen] = useState(false);
  const workStatusRef = useRef<HTMLDivElement>(null);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, "Must be only digits")
      .length(10, "Must be exactly 10 digits")
      .required("Phone number is required"),
    workStatus: Yup.string().required("Please select your work status"),
    organizationName: Yup.string().test(
      'required-if-needed',
      'This field is required',
      function (value) {
        const status = this.parent.workStatus;
        if (["Employee", "Student", "Freelancer"].includes(status)) {
          return !!value && value.trim().length > 0;
        }
        return true;
      }
    ),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    message: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      workStatus: "",
      organizationName: "",
      state: "",
      city: "",
      message: "",
    },
    validationSchema,
    onSubmit: () => {
      nextStep();
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (workStatusRef.current && !workStatusRef.current.contains(e.target as Node)) {
        setIsWorkStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handlePay = () => {
    setPaymentStatus('success');
    nextStep();
  };

  const steps = [
    { title: "Details", sub: "Enter info", num: "1" },
    { title: "Payment", sub: "Choose method", num: "2" },
    { title: "Confirmation", sub: "Final step", num: "3" }
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] relative overflow-x-hidden selection:bg-[#7C4DFF]/30 font-inter text-white flex flex-col">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Ambient Glows */}
      <div className={`hidden lg:block absolute top-[905px] left-[1076px] w-[728px] h-[728px] blur-[532px] opacity-60 mix-blend-plus-lighter z-0 transition-colors duration-500 ${paymentStatus === 'failed' ? 'bg-[#CF4141]' : 'bg-[#A52FFF]'}`} />
      <div className={`hidden lg:block absolute top-[-720px] left-[-340px] w-[728px] h-[728px] blur-[532px] opacity-60 mix-blend-plus-lighter z-0 transition-colors duration-500 ${paymentStatus === 'failed' ? 'bg-[#CF4141]' : 'bg-[#A52FFF]'}`} />
      
      <div className="relative z-10">
        <FlowHeader title=" " />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto pt-32 md:pt-40 lg:pt-48 px-6 text-center mb-12">
        <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-manrope font-extrabold text-white mb-4 tracking-tight">
          {currentStep === 2 ? (
            paymentStatus === 'failed' ? <span className="text-[#CF4141]">Payment Failed!</span> : <span className="text-[#98BD42]">Payment Successful!</span>
          ) : currentStep === 1 ? (
             <>Secure Your <span className="text-[#A52FFF]">Enrollment</span></>
          ) : (
            <>Join <span className="text-[#A52FFF]">Digital Atelier</span></>
          )}
        </motion.h1>
        <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto mb-10 opacity-80 border-none">
          {currentStep === 2 
            ? (paymentStatus === 'failed' ? "Your payment was cancelled. Your enrollment is still pending." : "Thank you for your enrollment. Your enrollment has been confirmed.")
            : currentStep === 1 
            ? "Complete your transaction securely using our encrypted payment gateway."
            : "Join 500+ professionals and elevate your design workflow. Complete your registration in 3 simple steps."}
        </p>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pb-24 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-[100px] px-6">
        
        {/* STEPPER */}
        <div className="hidden lg:flex w-[320px] bg-[#0A0A0B]/80 border border-white/10 rounded-[20px] py-6 flex-col backdrop-blur-xl gap-2">
          {steps.map((step, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            const isFailedStep = idx === 2 && paymentStatus === 'failed';
            
            return (
              <div 
                key={idx} 
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                className="relative w-full h-[64px] flex items-center px-4 cursor-pointer group"
              >
                {/* Vertical Indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="stepperIndicator"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-7 rounded-r-full shadow-[0_0_15px_rgba(124,77,255,0.4)] ${isFailedStep ? 'bg-[#FF4D4D]' : 'bg-[#CB87FF]'}`} 
                  />
                )}

                {/* Active Background Block */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="activeStepBG"
                      className={`absolute left-[14px] right-2 inset-y-1.5 rounded-full z-0 ${isFailedStep ? 'bg-[#FF4D4D]' : 'bg-[#A374F9]'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                {/* Step Content */}
                <div className="relative z-10 flex items-center gap-3 pl-6">
                  {/* Circle with Number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isActive ? 'bg-white text-black scale-105 shadow-md' : 
                    isCompleted ? 'bg-[#A374F9]/20 text-[#A374F9] border border-[#A374F9]/30' : 
                    'bg-white/5 text-white/20 border border-white/10'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.num}
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className={`font-ubuntu text-[16px] font-bold transition-colors duration-300 ${
                      isActive ? 'text-black' : 
                      isCompleted ? 'text-[#A374F9]' : 
                      'text-white/40'
                    }`}>
                      {step.title}
                    </span>
                    <span className={`font-ubuntu text-[12px] opacity-80 leading-tight transition-colors duration-300 ${
                      isActive ? 'text-black/60' : 
                      isCompleted ? 'text-[#A374F9]/60' : 
                      'text-white/20'
                    }`}>
                      {step.sub}
                    </span>
                  </div>
                </div>

                {/* Mobile logic: alert icon if failed and active */}
                {isActive && isFailedStep && (
                  <AlertCircle className="absolute right-6 w-5 h-5 text-white/60 z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[606px] flex flex-col gap-6">
               <div className="flex flex-col gap-2">
                <h2 className="font-ubuntu font-bold text-[30px] leading-tight text-white">Enrollment Information</h2>
                <p className="font-ubuntu text-base text-white/80">Enter your basic details to begin your enrollment.</p>
              </div>
              <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-[14px]">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] ${
                      formik.touched.firstName && formik.errors.firstName ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
                    }`}>
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        {...formik.getFieldProps('firstName')}
                        className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40" 
                      />
                    </div>
                    {formik.touched.firstName && formik.errors.firstName && <span className="text-red-500 text-xs ml-1">{formik.errors.firstName}</span>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] ${
                      formik.touched.lastName && formik.errors.lastName ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
                    }`}>
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        {...formik.getFieldProps('lastName')}
                        className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40" 
                      />
                    </div>
                    {formik.touched.lastName && formik.errors.lastName && <span className="text-red-500 text-xs ml-1">{formik.errors.lastName}</span>}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] ${
                    formik.touched.email && formik.errors.email ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
                  }`}>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      {...formik.getFieldProps('email')}
                      className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40" 
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && <span className="text-red-500 text-xs ml-1">{formik.errors.email}</span>}
                </div>

                <PhoneInput 
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={(val: string) => formik.setFieldValue('phoneNumber', val)}
                  onBlur={formik.handleBlur}
                  error={formik.errors.phoneNumber}
                  touched={formik.touched.phoneNumber}
                />

                <div className="relative" ref={workStatusRef}>
                  <div 
                    onClick={() => setIsWorkStatusOpen(!isWorkStatusOpen)}
                    className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] flex justify-between items-center cursor-pointer transition-all duration-300 group hover:bg-white/10 ${
                      formik.touched.workStatus && formik.errors.workStatus ? 'border-red-500' : 
                      isWorkStatusOpen ? 'border-[#A52FFF] shadow-[0_0_15px_rgba(165,47,255,0.25)]' : 'border-white/20'
                    }`}
                  >
                    <span className={`text-[15px] transition-colors ${formik.values.workStatus ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                      {formik.values.workStatus || "Working Status"}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-white/40 group-hover:text-white/60 transition-transform duration-300 ${isWorkStatusOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {formik.touched.workStatus && formik.errors.workStatus && <span className="text-red-500 text-xs mt-1 ml-1">{formik.errors.workStatus}</span>}
                  
                  <AnimatePresence>
                    {isWorkStatusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 top-[calc(100%+8px)] bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                      >
                        <div className="p-1">
                          {["Employee", "Student", "Freelancer", "Unemployed", "Other"].map((status) => (
                            <button
                               key={status}
                               type="button"
                               onClick={() => {
                                 formik.setFieldValue('workStatus', status);
                                 setIsWorkStatusOpen(false);
                               }}
                               className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 text-[14px] ${
                                 formik.values.workStatus === status 
                                   ? 'bg-[#7C4DFF]/20 text-white font-medium' 
                                   : 'text-white/60 hover:bg-white/5 hover:text-white'
                               }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {["Employee", "Student", "Freelancer"].includes(formik.values.workStatus) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1">
                        <div className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] ${
                          formik.touched.organizationName && formik.errors.organizationName ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
                        }`}>
                          <input 
                            type="text" 
                            placeholder={
                              formik.values.workStatus === 'Student' ? 'School / College Name' :
                              formik.values.workStatus === 'Freelancer' ? 'Freelancing Platform (e.g. Upwork)' :
                              'Company Name'
                            }
                            {...formik.getFieldProps('organizationName')}
                            className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40" 
                          />
                        </div>
                        {formik.touched.organizationName && formik.errors.organizationName && <span className="text-red-500 text-xs ml-1 mt-1 block">{formik.errors.organizationName as string}</span>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-[14px]">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] ${
                      formik.touched.state && formik.errors.state ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
                    }`}>
                      <input 
                        type="text" 
                        placeholder="State" 
                        {...formik.getFieldProps('state')}
                        className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40" 
                      />
                    </div>
                    {formik.touched.state && formik.errors.state && <span className="text-red-500 text-xs ml-1">{formik.errors.state}</span>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className={`bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] ${
                      formik.touched.city && formik.errors.city ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
                    }`}>
                      <input 
                        type="text" 
                        placeholder="City" 
                        {...formik.getFieldProps('city')}
                        className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40" 
                      />
                    </div>
                    {formik.touched.city && formik.errors.city && <span className="text-red-500 text-xs ml-1">{formik.errors.city}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className={`bg-white/[0.05] border border-white/20 rounded-[5px] p-[12px_14px] h-[109px] transition-all duration-300 focus-within:border-[#A52FFF] focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)]`}>
                    <textarea 
                      placeholder="Message (Optional)" 
                      {...formik.getFieldProps('message')}
                      className="w-full h-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40 resize-none" 
                    />
                  </div>
                </div>
              </form>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex justify-between items-center opacity-80"><span>Platform Fees:</span><span>Rs. 12,000</span></div>
                <div className="flex justify-between items-center opacity-80"><span>Tax (GST):</span><span>Rs. 2,160</span></div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center"><span className="font-bold text-lg">Total Fees:</span><span className="font-bold text-xl text-[#A52FFF]">Rs. 14,160</span></div>
              </div>
              <button 
                type="submit"
                onClick={() => formik.handleSubmit()}
                className={`w-full h-11 rounded-lg font-bold shadow-lg transition-all ${formik.isValid && formik.dirty ? 'bg-[#7C4DFF] shadow-purple-500/20 active:scale-[0.98] cursor-pointer' : 'bg-[#7C4DFF]/50 text-white/50 cursor-not-allowed'}`}
              >
                Proceed to Pay
              </button>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-[515px] flex flex-col gap-8">
              <div className="flex items-center gap-2 cursor-pointer text-white/60 hover:text-white transition-colors mb-2" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Registration</span>
              </div>
              <h2 className="text-3xl font-ubuntu font-bold">Payment Summary</h2>
               <div className="flex flex-col gap-4">
                  {[
                    { id: 'card', label: 'Credit/Debit Card' },
                    { id: 'netboarding', label: 'Netbanking' },
                    { id: 'upi', label: 'UPI (Scan / BHIM / GooglePay)' },
                    { id: 'wallet', label: 'Wallet (Paytm/PhonePe)' }
                  ].map(method => (
                    <div key={method.id} onClick={() => setPaymentMethod(method.id)} className={`flex items-center gap-4 cursor-pointer p-3 rounded-xl border transition-all duration-300 ${paymentMethod === method.id ? 'bg-[#7C4DFF]/10 border-[#7C4DFF]/50 shadow-[0_0_20px_rgba(124,77,255,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.07]'}`}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-[#7C4DFF] bg-[#7C4DFF]/20' : 'border-white/20'}`}>
                        {paymentMethod === method.id && <motion.div layoutId="activeSelection" className="w-2.5 h-2.5 bg-[#A52FFF] rounded-full shadow-[0_0_8px_#A52FFF]" />}
                      </div>
                      <span className={`font-inter font-medium text-base transition-colors ${paymentMethod === method.id ? 'text-white' : 'text-white/50'}`}>{method.label}</span>
                    </div>
                  ))}
                </div>
              <div className="flex flex-col gap-6 pt-4">
                <div className="space-y-1"><label className="text-sm opacity-60">Card number</label><div className="bg-white/5 border border-white/20 h-11 rounded-md flex items-center px-4"><input type="text" placeholder="0000 0000 0000 0000" className="bg-transparent border-none outline-none w-full" /><CreditCard className="w-5 h-5 opacity-40" /></div></div>
                <div className="space-y-1"><label className="text-sm opacity-60">Cardholder name</label><div className="bg-white/5 border border-white/20 h-11 rounded-md flex items-center px-4"><input type="text" placeholder="Jane Doe" className="bg-transparent border-none outline-none w-full" /></div></div>
                 <div className="flex gap-4">
                    <div className="flex-1 space-y-1"><label className="text-sm opacity-60">Expiry</label><input type="text" placeholder="MM/YY" className="bg-white/5 border border-white/20 h-11 rounded-md px-4 w-full" /></div>
                    <div className="flex-1 space-y-1"><label className="text-sm opacity-60">CVV</label><input type="text" placeholder="123" className="bg-white/5 border border-white/20 h-11 rounded-md px-4 w-full" /></div>
                 </div>
              </div>
              <button onClick={handlePay} className="w-full h-11 bg-[#7C4DFF] rounded-lg font-bold shadow-lg mt-4 cursor-pointer">Pay Now — Rs. 14,160</button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[488px] flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-2 text-center">
                 <div className="flex items-center gap-3">
                    <h2 className={`font-ubuntu font-bold text-[30px] ${paymentStatus === 'failed' ? 'text-[#CF4141]' : 'text-[#98BD42]'}`}>{paymentStatus === 'failed' ? "Payment Failed!" : "Payment Successful!"}</h2>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStatus === 'failed' ? 'bg-[#CF4141]' : 'bg-[#98BD42]'}`}>{paymentStatus === 'failed' ? <XCircle className="w-5 h-5 text-white" /> : <Check className="w-5 h-5 text-black" />}</div>
                 </div>
                 <p className="font-ubuntu text-base text-white/80">{paymentStatus === 'failed' ? "Your payment was cancelled. Your enrollment is still pending." : "Thank you for your enrollment. Your enrollment has been confirmed."}</p>
              </div>
              <div className="flex gap-4">
                {paymentStatus === 'failed' && <button onClick={() => { setPaymentStatus(null); setCurrentStep(1); }} className="px-6 py-2.5 rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/5 transition-all cursor-pointer"><RefreshCw className="w-4 h-4" /> Retry Payment</button>}
                <button className="px-6 py-2.5 rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/5 transition-all cursor-pointer"><MessageCircle className="w-5 h-5" /> Contact via WhatsApp</button>
              </div>
              <div className="w-full bg-white/[0.1] border border-white/20 rounded-[30px] p-8 backdrop-blur-md">
                <h3 className="font-ubuntu font-medium text-2xl mb-6">Enrollment Summary</h3>
                <div className="space-y-4">
                   <div className="flex justify-between"><span className="opacity-60">Platform :</span><span>Digital Atelier</span></div>
                   <div className="flex justify-between"><span className="opacity-60">User :</span><span>{formik.values.firstName} {formik.values.lastName}</span></div>
                   <div className="flex justify-between"><span className="opacity-60">Amount paid :</span><span>Rs. 14,160</span></div>
                   <div className="flex justify-between"><span className="opacity-60">Email :</span><span>{formik.values.email}</span></div>
                </div>
                <div className="h-px bg-white/10 my-6" />
                <div className="flex justify-between font-bold text-lg"><span>Total Paid:</span><span className={paymentStatus === 'failed' ? 'text-[#CF4141]' : 'text-[#98BD42]'}>Rs. 14,160</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* VALUE ASSURANCE SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="flex flex-col gap-12">
          {/* Section Header */}
          <div className="flex flex-col gap-2">
            <span className="text-[#A52FFF] font-bold text-sm tracking-[0.2em] uppercase">Value Assurance</span>
            <h2 className="text-4xl md:text-5xl font-manrope font-extrabold text-white tracking-tight">
              WHY ENROLL TODAY?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
            {/* FAQ Column */}
            <div className="flex flex-col gap-6">
              {[
                {
                  q: "What is included with Digital Atelier?",
                  a: "You get lifetime access to our premium design system, UI component library, and exclusive access to our AI Lab tools."
                },
                {
                  q: "Do I need advanced coding skills?",
                  a: "Not at all. We provide easy-to-use templates and comprehensive documentation. If you can use a browser, you can build with Digital Atelier."
                },
                {
                  q: "Are there any hidden costs or recurring fees?",
                  a: "No, this is a one-time enrollment granting you lifetime access and updates to the Digital Atelier ecosystem."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.05] transition-all">
                  <h4 className="text-lg font-bold text-white mb-3">{faq.q}</h4>
                  <p className="text-white/60 text-[15px] leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* Refund & Security Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#121212]/80 border border-white/10 rounded-[32px] p-8 md:p-10 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-white">Refund & Cancellation</h3>
                <p className="text-white/60 text-[15px] leading-relaxed">
                  We are dedicated to providing the highest quality ecosystem and ensuring user satisfaction. Our refund policy is designed to be fair and transparent.
                </p>
                <ul className="flex flex-col gap-4">
                  {[
                    "Dedicated customer support for all billing inquiries.",
                    "Simple and transparent cancellation process.",
                    "Transparency in pricing (GST included)."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A52FFF] mt-2 shadow-[0_0_8px_rgba(165,47,255,0.6)]" />
                      <span className="text-white/80 text-[14px] font-medium leading-tight group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="#" className="flex items-center gap-2 text-[#A52FFF] font-bold text-sm mt-2 hover:gap-3 transition-all">
                  Read full refund policy <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Secure Enrollment Badge */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center gap-5 group hover:bg-white/[0.05] transition-all">
                <div className="w-12 h-12 bg-[#98BD42]/10 rounded-full flex items-center justify-center text-[#98BD42] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">Secure Enrollment</h4>
                  <p className="text-white/40 text-xs leading-tight mt-1">
                    Payments are processed through SSL encrypted gateways (Cashfree/Razorpay).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SignupPage;
