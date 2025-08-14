"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Wallet, BarChart3, TrendingUp, Shield, Zap, ArrowRight, Play, CheckCircle, Clock, DollarSign } from "lucide-react"
import { ContractStatus } from "@/components/ContractStatus"

// Mock wallet connection hook
const useAccount = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connect = () => {
    setIsConnected(true)
    setAddress("0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c")
  }

  return { isConnected, address, connect }
}

export default function LandingPage() {
  const { isConnected, address, connect } = useAccount()
  const [showDashboard, setShowDashboard] = useState(false)
  const [demoScore, setDemoScore] = useState(0)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    if (showDemo) {
      const interval = setInterval(() => {
        setDemoScore((prev) => {
          if (prev >= 847) {
            clearInterval(interval)
            return 847
          }
          return prev + 15
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [showDemo])

  useEffect(() => {
    if (isConnected && address) {
      setShowDashboard(true)
    }
  }, [isConnected, address])

  if (showDashboard) {
    return <Dashboard address={address!} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Credo</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="cursor-pointer text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
            About
          </Button>
          <Button variant="ghost" className="cursor-pointer text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
            How it Works
          </Button>
          <Button onClick={connect} className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Your On-Chain
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Credit Score
                </span>
                <br />
                <span className="text-gray-700 text-4xl">
                  for Better DeFi
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Unlock under-collateralized loans and premium rates by building your on-chain reputation through verified DeFi activity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={connect} 
                size="lg" 
                className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all px-8 py-4 text-lg rounded-2xl"
              >
                Get My Score
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setShowDemo(true)} 
                className="cursor-pointer border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 px-8 py-4 text-lg rounded-2xl transition-all"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Secure & Private
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-blue-500" />
                Blockchain Verified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="w-4 h-4 text-purple-500" />
                Instant Results
              </div>
            </div>
          </div>

          {/* Interactive Demo Card */}
          <div className="relative">
            <Card className="p-10 bg-white/70 backdrop-blur-xl border-0 shadow-2xl rounded-3xl transform hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
              {/* Floating Background Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full transform translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full transform -translate-x-16 translate-y-16"></div>
              
              <CardContent className="text-center relative z-10">
                <div className="w-40 h-40 mx-auto mb-8 relative">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#gradient2)"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(demoScore / 850) * 314} 314`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {demoScore}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Your DeFi Credit Score</h3>
                <p className="text-gray-600 text-lg">Real-time analysis of blockchain activity</p>
                
                {/* Score metrics */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">95%</div>
                    <div className="text-xs text-gray-500">Payment History</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">2.3%</div>
                    <div className="text-xs text-gray-500">Utilization</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">7yrs</div>
                    <div className="text-xs text-gray-500">History</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white/50 backdrop-blur-xl py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Trusted by Leading DeFi Protocols
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamlessly integrated with the ecosystem's most innovative lending and credit platforms
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Aave</span>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <BarChart3 className="w-10 h-10 text-emerald-600" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">Compound</span>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <Zap className="w-10 h-10 text-purple-600" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-purple-600 transition-colors">MakerDAO</span>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                <TrendingUp className="w-10 h-10 text-orange-600" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">Morpho</span>
            </div>
          </div>
        </div>
      </section>

      {/* How Credo Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            How Credo Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three beautifully simple steps to unlock your DeFi credit potential
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group p-10 text-center hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/70 backdrop-blur-xl border-0 rounded-3xl hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">01</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Connect Wallet</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Securely connect your wallet to analyze your on-chain transaction history across multiple DeFi protocols.
              </p>
            </div>
          </Card>
          <Card className="group p-10 text-center hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/70 backdrop-blur-xl border-0 rounded-3xl hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-emerald-600 mb-2">02</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Get Your Score</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our advanced AI analyzes your DeFi behavior, payment history, and risk factors to generate your credit score.
              </p>
            </div>
          </Card>
          <Card className="group p-10 text-center hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/70 backdrop-blur-xl border-0 rounded-3xl hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">03</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Access Better Rates</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Use your score to access under-collateralized loans and premium rates across integrated protocols.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full transform translate-x-40 translate-y-40"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8 leading-tight">
            Ready to Unlock Your
            <br />
            <span className="bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
              DeFi Credit Potential?
            </span>
          </h2>
          <p className="text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who have already discovered their on-chain credit score
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={connect} 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer px-10 py-4 text-lg rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white/30 hover:border-white/50 hover:bg-white/10 text-white px-10 py-4 text-lg rounded-2xl transition-all"
            >
              Learn More
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-200 mb-2">10,000+</div>
              <div className="text-blue-200">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-200 mb-2">$50M+</div>
              <div className="text-blue-200">Credit Facilitated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-200 mb-2">99.8%</div>
              <div className="text-blue-200">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Dashboard Component
function Dashboard({ address }: { address: string }) {
  const [score, setScore] = useState<number | null>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [currentAddress, setCurrentAddress] = useState(address)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [currentNetwork, setCurrentNetwork] = useState("Ethereum")

  // Real API call to backend
  const getScore = async (walletAddress: string) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/score/${walletAddress}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch score')
      }

      const data = await response.json()
      
      if (data.success) {
        setScore(data.score)
        
        // Transform backend metrics to UI format
        const transformedMetrics = {
          walletAge: { 
            value: `${Math.floor(data.metrics.wallet_age_days / 365)}yrs`, 
            status: data.metrics.wallet_age_days > 730 ? "excellent" : data.metrics.wallet_age_days > 365 ? "good" : "fair", 
            impact: "high" 
          },
          transactionCount: { 
            value: data.metrics.transaction_count?.toString() || "0", 
            status: (data.metrics.transaction_count || 0) > 100 ? "excellent" : (data.metrics.transaction_count || 0) > 50 ? "good" : "fair", 
            impact: "high" 
          },
          uniqueTokens: { 
            value: data.metrics.unique_tokens?.toString() || "0", 
            status: (data.metrics.unique_tokens || 0) > 10 ? "excellent" : (data.metrics.unique_tokens || 0) > 5 ? "good" : "fair", 
            impact: "medium" 
          },
          liquidationCount: { 
            value: data.metrics.liquidation_count?.toString() || "0", 
            status: (data.metrics.liquidation_count || 0) === 0 ? "excellent" : "poor", 
            impact: "high" 
          },
          currentBalance: { 
            value: data.metrics.current_balance_usd ? `$${(data.metrics.current_balance_usd).toFixed(2)}` : "$0", 
            status: (data.metrics.current_balance_usd || 0) > 10000 ? "excellent" : (data.metrics.current_balance_usd || 0) > 1000 ? "good" : "fair", 
            impact: "medium" 
          }
        }
        
        setMetrics(transformedMetrics)
      } else {
        throw new Error(data.detail || 'Failed to get score')
      }
    } catch (error) {
      console.error("Error fetching score:", error)
      
      // Fallback to demo data if API fails
      const fallbackData = {
        score: 750,
        metrics: {
          walletAge: { value: "2yrs", status: "good", impact: "high" },
          transactionCount: { value: "156", status: "excellent", impact: "high" },
          uniqueTokens: { value: "12", status: "excellent", impact: "medium" },
          liquidationCount: { value: "0", status: "excellent", impact: "high" },
          currentBalance: { value: "$5,420", status: "good", impact: "medium" }
        }
      }
      
      setScore(fallbackData.score)
      setMetrics(fallbackData.metrics)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getScore(currentAddress)
  }, [currentAddress])

  const handleSearch = () => {
    if (searchAddress.trim()) {
      setCurrentAddress(searchAddress.trim())
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-emerald-600"
      case "good":
        return "text-blue-600"
      case "fair":
        return "text-orange-600"
      case "poor":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-emerald-50 border-emerald-200"
      case "good":
        return "bg-blue-50 border-blue-200"
      case "fair":
        return "bg-orange-50 border-orange-200"
      case "poor":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case "good":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "fair":
        return <Clock className="w-5 h-5 text-orange-600" />
      case "poor":
        return <Shield className="w-5 h-5 text-red-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-blue-100/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Credo</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-lg rounded-xl border border-blue-100 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{currentNetwork}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-lg rounded-xl border border-blue-100 shadow-lg">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 border-b border-blue-100/50">
            {["dashboard", "analytics", "history", "lending", "profile"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium capitalize cursor-pointer transition-all ${
                  activeTab === tab 
                    ? "border-b-2 border-blue-600 text-blue-600" 
                    : "text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search wallet address or ENS name..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-lg border border-blue-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 text-gray-800 placeholder-gray-500 shadow-lg"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Analyze
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Vertical Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 font-medium">Analyzing wallet activity...</p>
              <p className="text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        ) : (
          <>
            {/* Credit Score Card */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                DeFi Credit Score
              </h1>
              <p className="text-gray-600 mb-2">Wallet: {currentAddress.slice(0, 8)}...{currentAddress.slice(-8)}</p>
              <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <Card className="max-w-2xl mx-auto p-0 bg-white/70 backdrop-blur-xl border-0 transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-3xl cursor-pointer relative overflow-hidden rounded-3xl">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full transform translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full transform -translate-x-16 translate-y-16"></div>

                <div className="relative z-10 p-12">
                  {/* Score Display */}
                  <div className="text-center mb-8">
                    <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      {score}
                    </div>
                    <div className="text-xl text-gray-600 font-medium">
                      {score && score >= 800 ? "Excellent" : score && score >= 700 ? "Good" : score && score >= 600 ? "Fair" : "Building"}
                    </div>
                  </div>

                  {/* Score Range */}
                  <div className="mb-8">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                        style={{width: `${score ? (score / 850) * 100 : 0}%`}}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>300</span>
                      <span>500</span>
                      <span>700</span>
                      <span>850</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics?.liquidationCount?.value === "0" ? "✓" : "⚠"}
                      </div>
                      <div className="text-sm text-gray-500">Payment History</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics?.currentBalance?.value || "$0"}
                      </div>
                      <div className="text-sm text-gray-500">Balance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics?.walletAge?.value || "0yrs"}
                      </div>
                      <div className="text-sm text-gray-500">History</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Portfolio Overview */}
            <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
              <CardContent>
                <div className="flex items-center mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Portfolio Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-emerald-700 mb-1">
                      {metrics?.currentBalance?.value || "$0"}
                    </div>
                    <div className="text-sm text-emerald-600 font-medium">Current Balance</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      {metrics?.transactionCount?.value || "0"}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Total Transactions</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                    <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-purple-700 mb-1">
                      {metrics?.uniqueTokens?.value || "0"}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Unique Assets</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Factors - Vertical Stack */}
            {metrics && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Credit Score Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(metrics).map(([key, metric]: [string, any]) => (
                    <Card
                      key={key}
                      className="p-6 bg-white/70 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl group"
                    >
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className={`p-3 rounded-xl mr-4 ${getStatusBg(metric.status)}`}>
                              {getStatusIcon(metric.status)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-xl text-gray-800 capitalize mb-1 group-hover:text-blue-600 transition-colors">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {metric.impact === "high"
                                  ? "High Impact • Major factor in credit score"
                                  : metric.impact === "medium"
                                    ? "Medium Impact • Moderate factor in credit score"
                                    : "Low Impact • Minor factor in credit score"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${getStatusColor(metric.status)} mb-2`}>
                              {metric.value}
                            </div>
                            <Badge
                              className={`${getStatusBg(metric.status)} ${getStatusColor(metric.status)} text-sm font-bold border-2 px-3 py-1 rounded-xl`}
                            >
                              {metric.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* DeFi Opportunities */}
            <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
              <CardContent>
                <div className="flex items-center mb-6">
                  <Zap className="w-6 h-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Available Opportunities</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-50 to-green-100 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-4">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg group-hover:text-emerald-700 transition-colors">Under-collateralized Loan</div>
                        <div className="text-sm text-emerald-600">Up to $25,000 • 8.5% APR • Based on your score</div>
                      </div>
                    </div>
                    <Button className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Apply Now
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors">Premium Yield Farming</div>
                        <div className="text-sm text-blue-600">Exclusive pools • 12.3% APY • Credit score verified</div>
                      </div>
                    </div>
                    <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Access
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-50 to-indigo-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg group-hover:text-purple-700 transition-colors">Credit Line Increase</div>
                        <div className="text-sm text-purple-600">Boost your limits • Better rates • Instant approval</div>
                      </div>
                    </div>
                    <Button className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Upgrade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Status */}
            <ContractStatus />

            {/* Recent Activity */}
            <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
              <CardContent>
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mr-4" />
                      <div>
                        <div className="font-bold text-gray-800">Successful Repayment</div>
                        <div className="text-sm text-emerald-600">Aave protocol • 2 days ago • +15 score impact</div>
                      </div>
                    </div>
                    <div className="text-emerald-600 font-bold text-lg">+$2,500</div>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-blue-600 mr-4" />
                      <div>
                        <div className="font-bold text-gray-800">Liquidity Provided</div>
                        <div className="text-sm text-blue-600">Compound protocol • 5 days ago • +8 score impact</div>
                      </div>
                    </div>
                    <div className="text-blue-600 font-bold text-lg">$10,000</div>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center">
                      <Shield className="w-8 h-8 text-purple-600 mr-4" />
                      <div>
                        <div className="font-bold text-gray-800">Vault Management</div>
                        <div className="text-sm text-purple-600">MakerDAO • 1 week ago • +12 score impact</div>
                      </div>
                    </div>
                    <div className="text-purple-600 font-bold text-lg">$5,000</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
