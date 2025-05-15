import AudioRecorder from '@/components/AudioRecorder';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transcripción Médica Inteligente
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de transcripción automática para consultas médicas con IA
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-6">
          <AudioRecorder />
        </div>
      </div>
    </main>
  );
}
