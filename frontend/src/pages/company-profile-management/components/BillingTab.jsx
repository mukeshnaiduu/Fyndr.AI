import React, { useMemo, useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { PLANS, PLANS_BY_ID } from 'constants/plans';

const BillingTab = (props) => {
  const { onUpdate, isEditing, setIsEditing, registerSave } = props;
  const profile = props.profile || props.data || {};
  const toINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Plan state
  const [selectedPlan, setSelectedPlan] = useState((profile?.selected_plan || profile?.subscription_plan || 'professional').toLowerCase());
  const [billingCycle, setBillingCycle] = useState((profile?.billing_cycle || 'monthly').toLowerCase());

  // Payment methods state (tiles)
  const initialPaymentMethods = () => {
    const methods = Array.isArray(profile?.payment_methods) ? profile.payment_methods : [];
    if (!methods.length && (profile?.card_last_four || profile?.card_brand || profile?.card_expiry)) {
      return [{
        id: 'pm_legacy',
        brand: profile?.card_brand || 'Card',
        last4: profile?.card_last_four || '',
        expiry: profile?.card_expiry || '',
        name: profile?.card_name || '',
        default: true,
      }];
    }
    return methods;
  };
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [cardErrors, setCardErrors] = useState({});

  // Sync from profile updates
  useEffect(() => {
    setSelectedPlan((profile?.selected_plan || profile?.subscription_plan || 'professional').toLowerCase());
    setBillingCycle((profile?.billing_cycle || 'monthly').toLowerCase());
    const methods = Array.isArray(profile?.payment_methods) ? profile.payment_methods : [];
    if (methods.length) {
      setPaymentMethods(methods);
    } else if (profile?.card_last_four || profile?.card_brand || profile?.card_expiry) {
      setPaymentMethods([{ id: 'pm_legacy', brand: profile?.card_brand || 'Card', last4: profile?.card_last_four || '', expiry: profile?.card_expiry || '', name: profile?.card_name || '', default: true }]);
    } else {
      setPaymentMethods([]);
    }
  }, [profile]);

  const currentPlanObj = useMemo(() => PLANS_BY_ID[selectedPlan] || PLANS_BY_ID['professional'], [selectedPlan]);
  const price = billingCycle === 'yearly' ? currentPlanObj.yearlyPrice : currentPlanObj.monthlyPrice;

  // Save handler wiring
  const handleSave = async () => {
    // Prepare payload for backend; include full number per request
    const cleaned = paymentMethods.map(pm => ({
      id: pm.id,
      brand: pm.brand || '',
      last4: pm.last4 || '',
      expiry: pm.expiry || '',
      name: pm.name || '',
      number: pm.number || '',
      default: !!pm.default,
    }));
    const primary = cleaned.find(m => m.default) || cleaned[0];
    await onUpdate({
      selected_plan: selectedPlan,
      billing_cycle: billingCycle,
      payment_methods: cleaned,
      card_last_four: primary?.last4 || '',
      card_brand: primary?.brand || '',
      card_expiry: primary?.expiry || '',
      card_name: primary?.name || '',
    });
  };
  useEffect(() => {
    if (registerSave) registerSave(handleSave);
  }, [registerSave, selectedPlan, billingCycle, paymentMethods]);

  // Card helpers
  const sanitizeNumber = (s) => (s || '').replace(/\D/g, '');
  const formatCardNumber = (s) => {
    const digits = sanitizeNumber(s).slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const detectBrand = (num) => {
    if (/^4\d{12}(\d{3})?$/.test(num)) return 'Visa';
    if (/^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(num)) return 'Mastercard';
    if (/^3[47]\d{13}$/.test(num)) return 'Amex';
    if (/^6\d{15}$/.test(num)) return 'Discover';
    return 'Card';
  };
  const formatMasked = (last4) => `•••• ${last4 || '••••'}`;
  const validateCardFields = (fields, setErrors, opts = {}) => {
    const errors = {};
    const name = (fields.name || '').trim();
    const number = sanitizeNumber(fields.number || '');
    const expiry = (fields.expiry || '').trim();
    const cvc = (fields.cvc || '').trim();
    if (!name) errors.name = 'Cardholder name is required';
    if (opts.mode === 'edit') {
      // Allow keeping existing number (empty) or typed last4 equal to existing
      const existingLast4 = opts.existingLast4 || '';
      if (number.length === 0) {
        // ok: keep existing
      } else if (number.length === 4 && existingLast4 && number === existingLast4) {
        // ok: explicitly confirming last4, keep existing
      } else if (number.length !== 16) {
        errors.number = 'Enter 16-digit card number';
      }
    } else {
      if (number.length !== 16) errors.number = 'Enter 16-digit card number';
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) errors.expiry = 'Use MM/YY format';
    if (opts.mode === 'edit') {
      // CVC required only if number is being changed to full 12 digits
      const number = sanitizeNumber(fields.number || '');
      if (number.length === 16 && !/^\d{3,4}$/.test(cvc)) errors.cvc = 'CVC required when changing card';
    } else {
      if (!/^\d{3,4}$/.test(cvc)) errors.cvc = 'CVC must be 3-4 digits';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addPaymentMethod = () => {
    if (!validateCardFields(newCard, setCardErrors)) return;
    const number = sanitizeNumber(newCard.number);
    const last4 = number.slice(-4);
    const brand = detectBrand(number);
    const expiry = newCard.expiry.trim();
    const name = newCard.name.trim();
    const id = `pm_${Date.now()}`;
    // Persist full number as requested
    setPaymentMethods(prev => prev.concat([{ id, brand, last4, expiry, name, number, default: prev.length === 0 }]));
    setShowAddForm(false);
    setNewCard({ name: '', number: '', expiry: '', cvc: '' });
    setCardErrors({});
  };
  const removeMethod = (id) => {
    setPaymentMethods(prev => {
      const next = prev.filter(m => m.id !== id);
      if (!next.some(m => m.default) && next[0]) next[0].default = true;
      return [...next];
    });
  };
  const setDefaultMethod = (id) => setPaymentMethods(prev => prev.map(m => ({ ...m, default: m.id === id })));

  const currentPlan = selectedPlan;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Billing & Subscription</h3>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 capitalize">{currentPlan} Plan</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">Current subscription active until {profile?.next_billing_date || 'March 15, 2024'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{toINR(price)}/{billingCycle === 'yearly' ? 'year' : 'month'}</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 capitalize">{billingCycle} billing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Job Postings Used</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: `${((profile?.job_postings_used || 12) / (profile?.job_postings_limit || 50)) * 100}%` }}></div>
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-300">{profile?.job_postings_used || 12}/{profile?.job_postings_limit || 50}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Team Members</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: `${((profile?.team_members_count || 8) / (profile?.team_members_limit || 15)) * 100}%` }}></div>
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-300">{profile?.team_members_count || 8}/{profile?.team_members_limit || 15}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Current Plan Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(currentPlanObj.features || []).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon name="Check" size={16} className="text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Options (moved above history) */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Upgrade Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Change Plan</h5>
            <Select
              placeholder="Select plan"
              options={PLANS.map(p => ({ value: p.id, label: p.name }))}
              value={selectedPlan}
              onChange={(v) => setSelectedPlan(v)}
              disabled={!isEditing}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{currentPlanObj.description}</div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Billing Cycle</h5>
            <div className="flex items-center space-x-2">
              <Button variant={billingCycle === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => isEditing && setBillingCycle('monthly')}>Monthly</Button>
              <Button variant={billingCycle === 'yearly' ? 'default' : 'outline'} size="sm" onClick={() => isEditing && setBillingCycle('yearly')}>Yearly</Button>
              {billingCycle === 'yearly' && (<span className="ml-2 text-xs text-green-600">Save 20%</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods (tiles) */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Payment Methods</h4>
        {paymentMethods.length === 0 && !isEditing && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">No payment methods added.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((pm, idx) => (
            <div key={pm.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon name="CreditCard" size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{pm.brand}</span>
                  {pm.default && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Default</span>
                  )}
                </div>
              </div>
              {!pm._edit ? (
                <>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{formatMasked(pm.last4)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Exp: {pm.expiry || '—'}</div>
                  <div className="mt-3 flex items-center space-x-2">
                    {isEditing && !pm.default && (
                      <Button size="sm" variant="outline" onClick={() => setDefaultMethod(pm.id)}>Set Default</Button>
                    )}
                    {isEditing && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _edit: true, _editData: { name: m.name || '', number: (m.number || ''), expiry: m.expiry || '', cvc: '' }, _errors: {} } : m))}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => removeMethod(pm.id)}>Remove</Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <Input label="Cardholder Name" value={pm._editData?.name || ''} onChange={(e) => setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _editData: { ...m._editData, name: e.target.value }, _errors: { ...m._errors, name: undefined } } : m))} error={pm._errors?.name} required />
                    <Input label="Card Number" value={formatCardNumber(pm._editData?.number || '')} onChange={(e) => setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _editData: { ...m._editData, number: sanitizeNumber(e.target.value).slice(0, 16) }, _errors: { ...m._errors, number: undefined } } : m))} placeholder="1234 5678 9012 3456" error={pm._errors?.number} required />
                    <Input label="Expiry (MM/YY)" value={pm._editData?.expiry || ''} onChange={(e) => {
                      const raw = e.target.value || '';
                      const digits = raw.replace(/[^0-9]/g, '');
                      let formatted = '';
                      if (digits.length <= 2) {
                        formatted = digits;
                      } else {
                        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
                      }
                      if (formatted.length > 5) formatted = formatted.slice(0, 5);
                      setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _editData: { ...m._editData, expiry: formatted }, _errors: { ...m._errors, expiry: undefined } } : m));
                    }} placeholder="MM/YY" error={pm._errors?.expiry} required maxLength={5} />
                    <Input label="CVC" value={pm._editData?.cvc || ''} onChange={(e) => setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _editData: { ...m._editData, cvc: e.target.value }, _errors: { ...m._errors, cvc: undefined } } : m))} placeholder="123" error={pm._errors?.cvc} required />
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <Button size="sm" onClick={() => {
                      // validate and apply edits (allow keeping existing number)
                      const fields = pm._editData || { name: '', number: '', expiry: '', cvc: '' };
                      const ok = validateCardFields(fields, (errs) => setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _errors: errs } : m)), { mode: 'edit', existingLast4: pm.last4 });
                      if (!ok) return;
                      const number = sanitizeNumber(fields.number);
                      let last4 = pm.last4;
                      let brand = pm.brand;
                      if (number.length === 16) {
                        last4 = number.slice(-4);
                        brand = detectBrand(number);
                      }
                      const updated = { ...pm, name: fields.name.trim(), last4, brand, expiry: fields.expiry.trim(), _edit: false };
                      if (number.length === 16) {
                        updated.number = number; // persist full number as requested
                      }
                      delete updated._editData; delete updated._errors;
                      setPaymentMethods(prev => prev.map((m, i) => i === idx ? updated : m));
                    }}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setPaymentMethods(prev => prev.map((m, i) => i === idx ? { ...m, _edit: false, _editData: undefined, _errors: undefined } : m))}>Cancel</Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {isEditing && (
            <button type="button" className="p-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center" onClick={() => setShowAddForm(true)}>
              <Icon name="Plus" size={16} className="mr-2" /> Add Card
            </button>
          )}
        </div>

        {isEditing && showAddForm && (
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Add Card</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cardholder Name" value={newCard.name} onChange={(e) => setNewCard(v => ({ ...v, name: e.target.value }))} error={cardErrors.name} required />
              <Input label="Card Number" value={formatCardNumber(newCard.number)} onChange={(e) => setNewCard(v => ({ ...v, number: sanitizeNumber(e.target.value).slice(0, 16) }))} placeholder="1234 5678 9012 3456" error={cardErrors.number} required />
              <Input
                label="Expiry (MM/YY)"
                value={newCard.expiry}
                onChange={(e) => {
                  const raw = e.target.value || '';
                  const digits = raw.replace(/[^0-9]/g, '');
                  let formatted = '';
                  if (digits.length <= 2) {
                    formatted = digits;
                  } else {
                    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
                  }
                  if (formatted.length > 5) formatted = formatted.slice(0, 5);
                  setNewCard(v => ({ ...v, expiry: formatted }));
                }}
                placeholder="MM/YY"
                error={cardErrors.expiry}
                required
                maxLength={5}
              />
              <Input label="CVC" value={newCard.cvc} onChange={(e) => setNewCard(v => ({ ...v, cvc: e.target.value }))} placeholder="123" error={cardErrors.cvc} required />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Button size="sm" onClick={addPaymentMethod}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAddForm(false); setNewCard({ name: '', number: '', expiry: '', cvc: '' }); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Billing History (after upgrades) */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Billing History</h4>
        <div className="space-y-3">
          {[
            { date: 'Feb 15, 2024', amount: toINR(99), status: 'Paid', invoice: 'INV-001' },
            { date: 'Jan 15, 2024', amount: toINR(99), status: 'Paid', invoice: 'INV-002' },
            { date: 'Dec 15, 2023', amount: toINR(99), status: 'Paid', invoice: 'INV-003' }
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Receipt" size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{bill.invoice}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{bill.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{bill.amount}</span>
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">{bill.status}</span>
                <button className="text-primary hover:text-primary-dark">
                  <Icon name="Download" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { BillingTab };
