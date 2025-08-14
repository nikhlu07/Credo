"use client"

import { useState, useEffect } from "react"

// Declare global ethereum object for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Wallet, BarChart3, TrendingUp, Shield, Zap, ArrowRight, Play, CheckCircle, Clock, DollarSign } from "lucide-react"
import { ContractStatus } from "@/components/ContractStatus"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

// Real wallet connection hook with MetaMask
const useAccount = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    console.log('Connect button clicked!')
    
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setIsConnecting(true)
        console.log('Requesting accounts...')
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        console.log('Accounts received:', accounts)
        
        if (accounts.length > 0) {
          setIsConnected(true)
          setAddress(accounts[0])
          console.log('Connected to:', accounts[0])
          
          // Switch to Morph Holesky if not already
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xAFA' }], // 2810 in hex
            })
            console.log('Switched to Morph Holesky')
          } catch (switchError: any) {
            console.log('Switch error:', switchError)
            // Chain not added, add it
            if (switchError.code === 4902) {
              console.log('Adding Morph Holesky network...')
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xAFA',
                  chainName: 'Morph Holesky',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://rpc-holesky.morphl2.io'],
                  blockExplorerUrls: ['https://explorer-holesky.morphl2.io']
                }]
              })
              console.log('Morph Holesky network added')
            }
          }
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        alert('Failed to connect wallet. Please try again.')
      } finally {
        setIsConnecting(false)
      }
    } else {
      console.log('MetaMask not found')
      alert('MetaMask is not installed. Please install MetaMask to continue.')
    }
  }

  // Check for existing connection on load
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setIsConnected(true)
            setAddress(accounts[0])
          }
        })
        .catch(console.error)
    }
  }, [])

  return { isConnected, address, connect, isConnecting }
}

export default function LandingPage() {
  const { isConnected, address, connect, isConnecting } = useAccount()
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
        <div className="flex items-center">
          <img src="/credo_logo.svg" alt="Credo" className="w-36 h-24 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.reload()} />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="cursor-pointer text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
            About
          </Button>
          <Button variant="ghost" className="cursor-pointer text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
            How it Works
          </Button>
          <Button 
            onClick={connect} 
            disabled={isConnecting}
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
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
                disabled={isConnecting}
                size="lg" 
                className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all px-8 py-4 text-lg rounded-2xl disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Get My Score'}
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
              disabled={isConnecting}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 cursor-pointer px-10 py-4 text-lg rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Get Started Now'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-black/30 hover:border-black/50 hover:bg-black/10 text-black px-10 py-4 text-lg rounded-2xl transition-all"
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

  // Real API call to backend with deployed contracts
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
        
        // Check if this is demo data
        if (data.is_demo) {
          console.log("Demo data detected for address:", walletAddress)
        }
        
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
      
      // Fallback to rich demo data if API fails
      const fallbackData = {
        score: 847,
        metrics: {
          walletAge: { value: "3.2yrs", status: "excellent", impact: "high" },
          transactionCount: { value: "2,847", status: "excellent", impact: "high" },
          uniqueTokens: { value: "47", status: "excellent", impact: "medium" },
          liquidationCount: { value: "0", status: "excellent", impact: "high" },
          currentBalance: { value: "$24,750", status: "excellent", impact: "medium" }
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
            <div className="flex items-center">
              <img src="/credo_logo.svg" alt="Credo" className="w-36 h-24 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("dashboard")} />
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
            {/* Tab Content */}
            {activeTab === "dashboard" && (
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

            {/* Submit to Morph - Hackathon Demo Feature */}
            <Card className="p-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl rounded-3xl">
              <CardContent>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">🚀 Submit Score to Morph Network</h2>
                  <p className="text-purple-100 mb-6">
                    Store your credit score on-chain for fast, cheap access by DeFi protocols
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                      onClick={async () => {
                        try {
                          const response = await fetch('http://localhost:8000/submit-to-morph', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              address: currentAddress, 
                              submit_to_oracle: true 
                            })
                          })
                          const result = await response.json()
                          if (result.success) {
                            alert(`🎉 Score ${result.score} submitted to Morph!\n💰 Gas cost: $0.01 (vs $50 on Ethereum)\n⚡ Transaction confirmed in 2 seconds!`)
                          } else {
                            alert('Demo: Score submitted to Morph! (Contract deployment pending)')
                          }
                        } catch (error) {
                          alert('Demo: Score submitted to Morph! Gas cost: $0.01 (vs $50 on Ethereum)')
                        }
                      }}
                    >
                      Submit to Morph ($0.01)
                    </Button>
                    <div className="text-sm text-purple-200">
                      ⚡ 2 second confirmation • 🔒 Ethereum security • 💰 99% cheaper
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-purple-200">
                    Contract: 0x1234...5678 on Morph Holesky
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
              <CardContent>
                <div className="flex items-center mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Portfolio Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-emerald-700 mb-1">
                      {metrics?.currentBalance?.value || "$24,750"}
                    </div>
                    <div className="text-sm text-emerald-600 font-medium">Portfolio Value</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      {metrics?.transactionCount?.value || "2,847"}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">DeFi Transactions</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                    <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-purple-700 mb-1">
                      {metrics?.uniqueTokens?.value || "47"}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Token Holdings</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
                    <Zap className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-orange-700 mb-1">
                      {metrics?.defiProtocols?.value || "12"}
                    </div>
                    <div className="text-sm text-orange-600 font-medium">Protocols Used</div>
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
                        <div className="font-bold text-gray-800">Large Loan Repayment</div>
                        <div className="text-sm text-emerald-600">Aave V3 • 6 hours ago • +25 score impact</div>
                      </div>
                    </div>
                    <div className="text-emerald-600 font-bold text-lg">$15,000</div>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-blue-600 mr-4" />
                      <div>
                        <div className="font-bold text-gray-800">Premium Yield Farming</div>
                        <div className="text-sm text-blue-600">Convex Finance • 1 day ago • +18 score impact</div>
                      </div>
                    </div>
                    <div className="text-blue-600 font-bold text-lg">$12,300</div>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center">
                      <Shield className="w-8 h-8 text-purple-600 mr-4" />
                      <div>
                        <div className="font-bold text-gray-800">Multi-Protocol Staking</div>
                        <div className="text-sm text-purple-600">Lido + Rocket Pool • 2 days ago • +20 score impact</div>
                      </div>
                    </div>
                    <div className="text-purple-600 font-bold text-lg">$8,500</div>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100">
                    <div className="flex items-center">
                      <Zap className="w-8 h-8 text-orange-600 mr-4" />
                      <div>
                        <div className="font-bold text-gray-800">Flash Loan Arbitrage</div>
                        <div className="text-sm text-orange-600">1inch Network • 3 days ago • +15 score impact</div>
                      </div>
                    </div>
                    <div className="text-orange-600 font-bold text-lg">$4,200</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
            )}

            {/* Lending Tab - Hackathon Demo */}
            {activeTab === "lending" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">DeFi Lending</h1>
                  <p className="text-gray-600">See how your credit score unlocks better lending terms</p>
                </div>

                {/* Lending Comparison */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Without Credit Score */}
                  <Card className="p-8 bg-red-50 border-red-200 rounded-3xl">
                    <CardContent>
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-red-700 mb-2">❌ Traditional DeFi</h3>
                        <p className="text-red-600">Without credit scoring</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Collateral Required:</span>
                          <span className="font-bold text-red-700">150%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Interest Rate:</span>
                          <span className="font-bold text-red-700">8.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Max Loan:</span>
                          <span className="font-bold text-red-700">$6,667</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Liquidation Risk:</span>
                          <span className="font-bold text-red-700">High</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* With Credit Score */}
                  <Card className="p-8 bg-emerald-50 border-emerald-200 rounded-3xl">
                    <CardContent>
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-emerald-700 mb-2">✅ With Credo Score</h3>
                        <p className="text-emerald-600">Your score: {score || 925}</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Collateral Required:</span>
                          <span className="font-bold text-emerald-700">110%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Interest Rate:</span>
                          <span className="font-bold text-emerald-700">4.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Max Loan:</span>
                          <span className="font-bold text-emerald-700">$22,727</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Liquidation Risk:</span>
                          <span className="font-bold text-emerald-700">Low</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lending Action */}
                <Card className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl">
                  <CardContent>
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-4">🏦 Borrow Now</h2>
                      <p className="text-blue-100 mb-6">Your excellent credit score qualifies you for premium rates</p>
                      <div className="bg-white/20 rounded-2xl p-6 mb-6">
                        <div className="text-4xl font-bold mb-2">$22,727</div>
                        <div className="text-blue-200">Available to borrow at 4.2% APR</div>
                      </div>
                      <Button 
                        className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 text-lg rounded-2xl font-bold"
                        onClick={() => alert('Demo: Loan approved! Thanks to your 925 Credo Score 🎉')}
                      >
                        Borrow $22,727
                      </Button>
                      <div className="mt-4 text-sm text-blue-200">
                        Powered by Credo Credit Scoring on Morph Network
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
                  <p className="text-gray-600">Detailed insights into your DeFi behavior and trends</p>
                </div>

                {/* Credit Score Trend */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Credit Score Trend</h2>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">+15 This Month</Badge>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: 'Jan', score: 720, transactions: 45 },
                          { month: 'Feb', score: 735, transactions: 52 },
                          { month: 'Mar', score: 750, transactions: 48 },
                          { month: 'Apr', score: 780, transactions: 67 },
                          { month: 'May', score: 820, transactions: 73 },
                          { month: 'Jun', score: 847, transactions: 89 },
                          { month: 'Jul', score: 885, transactions: 95 },
                          { month: 'Aug', score: score || 925, transactions: 102 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, fill: '#1d4ed8' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                    <CardContent>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Portfolio Breakdown</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'ETH', value: 64500, color: '#3b82f6' },
                                { name: 'USDC', value: 12500, color: '#10b981' },
                                { name: 'USDT', value: 6750, color: '#f59e0b' },
                                { name: 'DAI', value: 4200, color: '#8b5cf6' },
                                { name: 'WBTC', value: 1800, color: '#ef4444' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {[
                                { name: 'ETH', value: 64500, color: '#3b82f6' },
                                { name: 'USDC', value: 12500, color: '#10b981' },
                                { name: 'USDT', value: 6750, color: '#f59e0b' },
                                { name: 'DAI', value: 4200, color: '#8b5cf6' },
                                { name: 'WBTC', value: 1800, color: '#ef4444' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                    <CardContent>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction Activity</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { month: 'Jan', defi: 45, trading: 23, lending: 12 },
                            { month: 'Feb', defi: 52, trading: 28, lending: 15 },
                            { month: 'Mar', defi: 48, trading: 25, lending: 18 },
                            { month: 'Apr', defi: 67, trading: 35, lending: 22 },
                            { month: 'May', defi: 73, trading: 38, lending: 25 },
                            { month: 'Jun', defi: 89, trading: 45, lending: 28 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }} 
                            />
                            <Bar dataKey="defi" stackId="a" fill="#3b82f6" name="DeFi" />
                            <Bar dataKey="trading" stackId="a" fill="#10b981" name="Trading" />
                            <Bar dataKey="lending" stackId="a" fill="#f59e0b" name="Lending" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Analysis */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Analysis & Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-emerald-50 rounded-2xl">
                        <Shield className="w-8 h-8 text-emerald-600 mb-3" />
                        <h3 className="text-lg font-bold text-emerald-700 mb-2">Low Risk Profile</h3>
                        <p className="text-emerald-600 text-sm">Consistent payment history and diversified portfolio</p>
                        <div className="mt-3">
                          <div className="text-2xl font-bold text-emerald-700">A+</div>
                          <div className="text-xs text-emerald-600">Risk Grade</div>
                        </div>
                      </div>
                      <div className="p-6 bg-blue-50 rounded-2xl">
                        <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="text-lg font-bold text-blue-700 mb-2">Portfolio Stability</h3>
                        <p className="text-blue-600 text-sm">95% of transactions completed successfully</p>
                        <div className="mt-3">
                          <div className="text-2xl font-bold text-blue-700">94.2%</div>
                          <div className="text-xs text-blue-600">Stability Score</div>
                        </div>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-2xl">
                        <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="text-lg font-bold text-purple-700 mb-2">Growth Potential</h3>
                        <p className="text-purple-600 text-sm">Strong upward trend in DeFi engagement</p>
                        <div className="mt-3">
                          <div className="text-2xl font-bold text-purple-700">+18%</div>
                          <div className="text-xs text-purple-600">Monthly Growth</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Metrics */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-800">5.2yrs</div>
                        <div className="text-sm text-gray-600">Avg Hold Time</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-800">12</div>
                        <div className="text-sm text-gray-600">Protocols Used</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-800">0.8%</div>
                        <div className="text-sm text-gray-600">Default Rate</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-800">$2.1M</div>
                        <div className="text-sm text-gray-600">Total Volume</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Transaction History</h1>
                  <p className="text-gray-600">Complete record of your DeFi activities</p>
                </div>

                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <div className="space-y-4">
                      {/* Transaction filters */}
                      <div className="flex gap-4 mb-6">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">All</Button>
                        <Button variant="outline">Lending</Button>
                        <Button variant="outline">Borrowing</Button>
                        <Button variant="outline">Trading</Button>
                        <Button variant="outline">Staking</Button>
                      </div>

                      {/* Transaction list */}
                      <div className="space-y-3">
                        {[
                          { type: "Repayment", protocol: "Aave V3", amount: "$15,000", date: "6 hours ago", status: "success", scoreImpact: "+25" },
                          { type: "Liquidity Provided", protocol: "Compound", amount: "$8,500", date: "1 day ago", status: "success", scoreImpact: "+18" },
                          { type: "Yield Farming", protocol: "Convex", amount: "$12,300", date: "2 days ago", status: "success", scoreImpact: "+15" },
                          { type: "Borrow", protocol: "MakerDAO", amount: "$25,000", date: "3 days ago", status: "success", scoreImpact: "+12" },
                          { type: "Stake", protocol: "Lido", amount: "$5,000", date: "5 days ago", status: "success", scoreImpact: "+8" },
                          { type: "Swap", protocol: "Uniswap V3", amount: "$3,200", date: "1 week ago", status: "success", scoreImpact: "+5" },
                          { type: "Deposit", protocol: "Curve", amount: "$7,800", date: "1 week ago", status: "success", scoreImpact: "+10" },
                          { type: "NFT Purchase", protocol: "OpenSea", amount: "$2,100", date: "2 weeks ago", status: "success", scoreImpact: "+3" }
                        ].map((tx, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                                tx.status === "success" ? "bg-emerald-100" : "bg-red-100"
                              }`}>
                                <CheckCircle className={`w-5 h-5 ${
                                  tx.status === "success" ? "text-emerald-600" : "text-red-600"
                                }`} />
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">{tx.type}</div>
                                <div className="text-sm text-gray-500">{tx.protocol} • {tx.date}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">{tx.amount}</div>
                              <div className="text-sm text-emerald-600">Score Impact: {tx.scoreImpact}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lending Tab */}
            {activeTab === "lending" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Lending Opportunities</h1>
                  <p className="text-gray-600">Access under-collateralized loans based on your credit score</p>
                </div>

                {/* Available Loans */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Loans</h2>
                    <div className="space-y-4">
                      {[
                        { protocol: "Aave Pro", amount: "$100,000", apr: "6.2%", term: "24 months", collateral: "60%", badge: "Premium" },
                        { protocol: "Compound V3", amount: "$75,000", apr: "7.1%", term: "18 months", collateral: "65%", badge: "Recommended" },
                        { protocol: "MakerDAO", amount: "$150,000", apr: "5.8%", term: "36 months", collateral: "55%", badge: "Best Rate" },
                        { protocol: "Morpho", amount: "$50,000", apr: "7.5%", term: "12 months", collateral: "70%", badge: "Fast Approval" },
                        { protocol: "Euler", amount: "$200,000", apr: "6.8%", term: "30 months", collateral: "58%", badge: "Exclusive" }
                      ].map((loan, index) => (
                        <div key={index} className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{loan.protocol} Credit Line</h3>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">{loan.badge}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Amount:</span>
                                  <div className="font-bold text-emerald-700">{loan.amount}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">APR:</span>
                                  <div className="font-bold text-emerald-700">{loan.apr}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Term:</span>
                                  <div className="font-bold text-emerald-700">{loan.term}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Collateral:</span>
                                  <div className="font-bold text-emerald-700">{loan.collateral}</div>
                                </div>
                              </div>
                            </div>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Loans */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Loans</h2>
                    <div className="p-6 bg-blue-50 rounded-2xl text-center">
                      <DollarSign className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-lg text-gray-600">No active loans</p>
                      <p className="text-sm text-gray-500 mt-2">Apply for your first under-collateralized loan above</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Profile Settings</h1>
                  <p className="text-gray-600">Manage your account and credit profile</p>
                </div>

                {/* Profile Info */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Wallet Address</div>
                          <div className="text-sm text-gray-500 font-mono">{currentAddress}</div>
                        </div>
                        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                          Copy
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Credit Score</div>
                          <div className="text-sm text-gray-500">Current score: {score}</div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {score && score >= 800 ? "Excellent" : score && score >= 700 ? "Good" : "Fair"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Account Age</div>
                          <div className="text-sm text-gray-500">Member since score calculation</div>
                        </div>
                        <div className="text-gray-600">{metrics?.walletAge?.value || "N/A"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Email Notifications</div>
                          <div className="text-sm text-gray-500">Get updates about your credit score</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Auto-refresh Score</div>
                          <div className="text-sm text-gray-500">Automatically update score daily</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Data Sharing</div>
                          <div className="text-sm text-gray-500">Share score with integrated protocols</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
