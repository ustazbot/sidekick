export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Pembayaran Berjaya!</h1>
        <p className="text-gray-600 text-sm mb-6">
          Terima kasih kerana menyertai SIDEKICK.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-800 font-semibold mb-1">Langkah seterusnya:</p>
          <p className="text-sm text-blue-700">
            Semak email anda — kami telah menghantar link untuk masuk ke dashboard SIDEKICK.
          </p>
        </div>
      </div>
    </main>
  )
}
