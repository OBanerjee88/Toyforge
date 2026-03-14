'use client';

export default function UpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#fdf8f0] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[#e8d5b0]">
        
        {/* Icon */}
        <div className="text-center mb-4">
          <span className="text-5xl">✨</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-[#2c1810] text-center mb-2">
          Daily Limit Reached
        </h2>
        <p className="text-[#8b5e3c] text-center mb-6">
          You've used all <strong>10 free AI queries</strong> for today.<br />
          Upgrade to Pro for unlimited access.
        </p>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-[#e8d5b0]">
          <p className="text-sm font-semibold text-[#2c1810] mb-3">Pro Plan — ₹199/month</p>
          <ul className="space-y-2 text-sm text-[#5a3e28]">
            <li>✅ Unlimited AI queries every day</li>
            <li>✅ Design alternatives 2, 3 & 4</li>
            <li>✅ PDF Vastu reports</li>
            <li>✅ Save unlimited plans</li>
            <li>✅ Ad-free experience</li>
          </ul>
        </div>

        {/* Buttons */}
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white font-semibold py-3 rounded-xl mb-3 transition-colors"
        >
          Upgrade to Pro ✨
        </button>
        <button
          onClick={onClose}
          className="w-full text-[#8b5e3c] text-sm py-2 hover:underline"
        >
          Come back tomorrow (resets at midnight)
        </button>
      </div>
    </div>
  );
}
