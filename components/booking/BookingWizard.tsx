'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service, Staff, AvailableSlot } from '@/lib/types';
import {
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface BookingWizardProps {
  initialServices: Service[];
  initialStaff: Staff[];
}

export default function BookingWizard({ initialServices, initialStaff }: BookingWizardProps) {
  const router = useRouter();

  // Step state (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Selected state
  const [services] = useState<Service[]>(initialServices);
  const [staffList] = useState<Staff[]>(initialStaff);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any'); // 'any' or specific ID

  // Date & slot selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Customer details
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calendar month state for step 3
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  // Fetch slots whenever selectedDate, selectedStaffId, or selectedService changes
  useEffect(() => {
    if (!selectedService || step !== 3) return;

    let isMounted = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotError(null);
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `/api/slots?staff_id=${selectedStaffId}&service_id=${selectedService!.id}&date=${selectedDate}`
        );
        const data = await res.json();

        if (isMounted) {
          if (data.success) {
            setAvailableSlots(data.slots || []);
          } else {
            setSlotError(data.error || 'Failed to load time slots');
            setAvailableSlots([]);
          }
        }
      } catch {
        if (isMounted) {
          setSlotError('Could not connect to appointment service.');
          setAvailableSlots([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSlots(false);
        }
      }
    }

    fetchSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedService, selectedStaffId, selectedDate, step]);

  // Step 1: Select Service
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Select Barber
  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3: Select Slot & Advance
  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validate Step 4 Details Form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customer.firstName.trim()) errors.firstName = 'First name is required';
    if (!customer.lastName.trim()) errors.lastName = 'Last name is required';
    if (!customer.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!customer.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (customer.phone.trim().length < 8) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 5: Confirm & Submit Booking
  const handleFinalSubmit = async () => {
    if (!selectedService || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          staff_id: selectedSlot.staffId,
          start_time: selectedSlot.startTime,
          customer_first_name: customer.firstName,
          customer_last_name: customer.lastName,
          customer_email: customer.email,
          customer_phone: customer.phone,
          notes: customer.notes,
        }),
      });

      const data = await res.json();

      if (data.success && data.booking) {
        // Save booking into sessionStorage for instant success retrieval
        sessionStorage.setItem('last_fade_booking', JSON.stringify(data.booking));
        router.push(`/book/success?booking_id=${data.booking.id}`);
      } else {
        setSubmitError(data.error || 'Failed to confirm booking. Please try again.');
        setSubmitting(false);
      }
    } catch {
      setSubmitError('Network error while creating booking. Please try again.');
      setSubmitting(false);
    }
  };

  // Calendar Helpers for Step 3
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();
  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    const today = new Date();
    const prev = new Date(currentYear, currentMonth - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonthDate(prev);
    }
  };

  const nextMonth = () => {
    const next = new Date(currentYear, currentMonth + 1, 1);
    setCurrentMonthDate(next);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const selectedStaffObj = staffList.find((s) => s.id === selectedStaffId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header Branding */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#333333] text-xs font-semibold uppercase tracking-widest text-[#c9a84c] mb-3">
          <Scissors className="w-3.5 h-3.5 text-[#c9a84c]" />
          47 King Street, Manchester
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-serif">
          Fade & Co.
        </h1>
        <p className="mt-2 text-sm md:text-base text-zinc-400 max-w-md mx-auto">
          Crafted grooming & precision cuts. Reserve your chair in seconds.
        </p>
      </div>

      {/* Step Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-[#c9a84c] -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />

          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Barber' },
            { num: 3, label: 'Time' },
            { num: 4, label: 'Details' },
            { num: 5, label: 'Confirm' },
          ].map((item) => {
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;

            return (
              <div key={item.num} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (item.num < step) setStep(item.num);
                  }}
                  disabled={item.num > step}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#c9a84c] text-black shadow-lg shadow-[#c9a84c]/20'
                      : isCurrent
                      ? 'bg-[#1a1a1a] text-[#c9a84c] border-2 border-[#c9a84c] shadow-lg shadow-[#c9a84c]/30 scale-110'
                      : 'bg-[#1e1e1e] text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : item.num}
                </button>
                <span
                  className={`text-[11px] mt-1.5 font-medium transition-colors hidden sm:block ${
                    isCurrent ? 'text-[#c9a84c]' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 md:p-8 shadow-2xl relative">
        {/* Back Button */}
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-[#c9a84c] mb-6 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to previous step
          </button>
        )}

        {/* STEP 1: PICK A SERVICE */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-serif">1. Select a Service</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Choose the treatment you would like to book today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className={`cursor-pointer group relative rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-[#c9a84c] shadow-lg shadow-[#c9a84c]/10'
                        : 'bg-[#202020] border-zinc-800 hover:border-zinc-700 hover:bg-[#252525]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg text-white group-hover:text-[#c9a84c] transition-colors">
                          {service.name}
                        </h3>
                        <span className="text-lg font-bold text-[#c9a84c] whitespace-nowrap">
                          £{service.price_gbp}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {service.duration_minutes} minutes
                      </span>
                      <span className="text-xs font-semibold text-[#c9a84c] group-hover:underline">
                        Select &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PICK A BARBER */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-serif">2. Choose Your Barber</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Select your preferred barber or choose Any Available for the fastest slot.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Any Available Option */}
              <div
                onClick={() => handleSelectStaff('any')}
                className={`cursor-pointer group rounded-xl p-5 border text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[190px] ${
                  selectedStaffId === 'any'
                    ? 'bg-zinc-900 border-[#c9a84c] shadow-lg shadow-[#c9a84c]/10'
                    : 'bg-[#202020] border-zinc-800 hover:border-zinc-700 hover:bg-[#252525]'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#c9a84c]/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-7 h-7 text-[#c9a84c]" />
                </div>
                <h3 className="font-semibold text-white group-hover:text-[#c9a84c] text-base">
                  Any Available
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Maximum slot availability</p>
              </div>

              {/* Staff Cards */}
              {staffList.map((barber) => {
                const isSelected = selectedStaffId === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => handleSelectStaff(barber.id)}
                    className={`cursor-pointer group rounded-xl p-5 border text-center transition-all duration-200 flex flex-col items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-[#c9a84c] shadow-lg shadow-[#c9a84c]/10'
                        : 'bg-[#202020] border-zinc-800 hover:border-zinc-700 hover:bg-[#252525]'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-zinc-700 group-hover:border-[#c9a84c] transition-colors relative bg-zinc-800">
                        {barber.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={barber.photo_url}
                            alt={barber.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-[#c9a84c] text-base">
                        {barber.name}
                      </h3>
                      <span className="text-xs text-zinc-400 mt-1">Master Barber</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full">
                      <span className="text-xs font-semibold text-[#c9a84c] group-hover:underline">
                        Choose {barber.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: PICK DATE & TIME */}
        {step === 3 && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white font-serif">3. Pick Date & Time</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Service: <strong className="text-[#c9a84c]">{selectedService?.name}</strong> &bull; Barber:{' '}
                  <strong className="text-white">
                    {selectedStaffId === 'any' ? 'Any Available' : selectedStaffObj?.name}
                  </strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Calendar Column */}
              <div className="lg:col-span-6 bg-[#202020] border border-zinc-800 rounded-xl p-5">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base text-white">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-400 mb-2">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Day numbers */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-9" />
                  ))}

                  {Array.from({ length: daysCount }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateObj = new Date(currentYear, currentMonth, dayNum);
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                      dayNum
                    ).padStart(2, '0')}`;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // 30 days max advance
                    const maxAdvanceDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const isPast = dateObj < today;
                    const isTooFar = dateObj > maxAdvanceDate;
                    const isDisabled = isPast || isTooFar;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`h-9 w-full rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#c9a84c] text-black font-bold shadow-md shadow-[#c9a84c]/30'
                            : isDisabled
                            ? 'text-zinc-600 opacity-40 cursor-not-allowed'
                            : 'text-zinc-200 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Column */}
              <div className="lg:col-span-6 flex flex-col">
                <h3 className="font-semibold text-base text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c9a84c]" />
                  Available Times for {selectedDate}
                </h3>

                {loadingSlots ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#202020] border border-zinc-800 rounded-xl">
                    <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin mb-2" />
                    <p className="text-xs text-zinc-400">Checking barber schedule...</p>
                  </div>
                ) : slotError ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-red-950/20 border border-red-900/30 rounded-xl text-center">
                    <p className="text-xs text-red-400">{slotError}</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#202020] border border-zinc-800 rounded-xl text-center">
                    <CalendarIcon className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="text-sm font-medium text-zinc-300">No available slots</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      The barbershop is either closed or fully booked on this date. Please pick another date.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 max-h-[320px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {availableSlots.map((slot) => {
                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className="p-3 rounded-lg border text-center transition-all bg-[#202020] border-zinc-800 hover:border-[#c9a84c] hover:bg-[#282828] group"
                          >
                            <span className="block text-sm font-semibold text-white group-hover:text-[#c9a84c]">
                              {slot.timeFormatted}
                            </span>
                            {selectedStaffId === 'any' && slot.staffName && (
                              <span className="block text-[10px] text-zinc-400 mt-0.5 truncate">
                                with {slot.staffName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ENTER DETAILS */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-serif">4. Your Details</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Where should we send your booking confirmation & calendar invite?
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={customer.firstName}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    className={`w-full bg-[#202020] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c] ${
                      formErrors.firstName ? 'border-red-500' : 'border-zinc-800'
                    }`}
                    placeholder="Marcus"
                  />
                  {formErrors.firstName && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={customer.lastName}
                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    className={`w-full bg-[#202020] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c] ${
                      formErrors.lastName ? 'border-red-500' : 'border-zinc-800'
                    }`}
                    placeholder="Sterling"
                  />
                  {formErrors.lastName && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className={`w-full bg-[#202020] border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c] ${
                      formErrors.email ? 'border-red-500' : 'border-zinc-800'
                    }`}
                    placeholder="marcus@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className={`w-full bg-[#202020] border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c9a84c] ${
                      formErrors.phone ? 'border-red-500' : 'border-zinc-800'
                    }`}
                    placeholder="+44 7700 900000"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Optional Notes
                </label>
                <textarea
                  rows={2}
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full bg-[#202020] border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
                  placeholder="Any styling requests or requirements..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl gold-btn text-black font-bold uppercase tracking-wider text-sm shadow-lg cursor-pointer"
                >
                  Review Booking Summary &rarr;
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: CONFIRM BOOKING SUMMARY */}
        {step === 5 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-serif">5. Confirm Your Booking</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Please review your appointment summary before finalizing.
              </p>
            </div>

            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Appointment Card */}
              <div className="bg-[#202020] border border-zinc-800 rounded-xl p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">
                  Appointment Details
                </span>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Service:</span>
                    <span className="font-semibold text-white">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Duration:</span>
                    <span className="text-zinc-300">{selectedService?.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Barber:</span>
                    <span className="font-semibold text-white">{selectedSlot?.staffName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Date:</span>
                    <span className="text-zinc-300">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Time:</span>
                    <span className="font-bold text-[#c9a84c]">{selectedSlot?.timeFormatted}</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-700/60 flex justify-between items-center">
                    <span className="font-semibold text-white">Total Price:</span>
                    <span className="text-xl font-extrabold text-[#c9a84c]">
                      £{selectedService?.price_gbp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Location Details */}
              <div className="bg-[#202020] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">
                    Customer Information
                  </span>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-white font-medium">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-zinc-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      {customer.email}
                    </p>
                    <p className="text-zinc-400 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      {customer.phone}
                    </p>
                    {customer.notes && (
                      <p className="text-xs text-zinc-400 bg-zinc-900/60 p-2 rounded mt-2 border border-zinc-800">
                        <strong className="text-zinc-300">Note:</strong> {customer.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#c9a84c] shrink-0" />
                  <span>47 King Street, Manchester, UK</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl gold-btn text-black font-extrabold uppercase tracking-wider text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Securing Your Chair...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Confirm Booking (£{selectedService?.price_gbp})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs text-zinc-500 space-y-2">
        <p>&copy; {new Date().getFullYear()} Fade & Co. Barbershop Manchester &bull; All Rights Reserved</p>
        <p>Tel: +44 7700 900123 &bull; hello@fadeandco.com</p>
      </div>
    </div>
  );
}
