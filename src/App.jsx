import React from 'react'

function App() {
  return (
    <div className="App">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Credo Frontend
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Please use the Next.js version at /credo-frontend for the complete experience
          </p>
          <a 
            href="http://localhost:3000" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-2xl hover:shadow-lg transition-all"
          >
            Go to Next.js App
          </a>
        </div>
      </div>
    </div>
  )
}

export default App