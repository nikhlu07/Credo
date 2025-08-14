"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react"

interface ContractInfo {
  name: string
  address: string | null
  status: 'deployed' | 'not-deployed' | 'checking'
  explorerUrl?: string
}

export function ContractStatus() {
  const [contracts, setContracts] = useState<ContractInfo[]>([
    {
      name: "Score Oracle",
      address: null,
      status: 'checking'
    },
    {
      name: "Score Registry", 
      address: null,
      status: 'checking'
    }
  ])

  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  useEffect(() => {
    checkContractStatus()
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health')
      if (response.ok) {
        setBackendStatus('connected')
      } else {
        setBackendStatus('disconnected')
      }
    } catch (error) {
      setBackendStatus('disconnected')
    }
  }

  const checkContractStatus = async () => {
    try {
      // Check if backend has contract addresses configured
      const response = await fetch('http://localhost:8000/contract-status')
      if (response.ok) {
        const data = await response.json()
        
        setContracts([
          {
            name: "Score Oracle",
            address: data.oracle_address,
            status: data.oracle_address ? 'deployed' : 'not-deployed',
            explorerUrl: data.oracle_address ? `https://explorer-holesky.morphl2.io/address/${data.oracle_address}` : undefined
          },
          {
            name: "Score Registry",
            address: data.registry_address, 
            status: data.registry_address ? 'deployed' : 'not-deployed',
            explorerUrl: data.registry_address ? `https://explorer-holesky.morphl2.io/address/${data.registry_address}` : undefined
          }
        ])
      } else {
        // Fallback: assume not deployed
        setContracts(prev => prev.map(c => ({ ...c, status: 'not-deployed' as const })))
      }
    } catch (error) {
      // Backend not available or contracts not deployed
      setContracts(prev => prev.map(c => ({ ...c, status: 'not-deployed' as const })))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'not-deployed':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Deployed</Badge>
      case 'not-deployed':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Not Deployed</Badge>
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Checking...</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Unknown</Badge>
    }
  }

  const getBackendStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Connected</Badge>
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Disconnected</Badge>
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Checking...</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Unknown</Badge>
    }
  }

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">System Status</h3>
          <button 
            onClick={() => {
              checkBackendStatus()
              checkContractStatus()
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Backend Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              {getStatusIcon(backendStatus)}
              <span className="ml-2 font-medium text-gray-800">Backend API</span>
            </div>
            <div className="flex items-center gap-2">
              {getBackendStatusBadge(backendStatus)}
              {backendStatus === 'connected' && (
                <a 
                  href="http://localhost:8000/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Contract Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 text-sm">Smart Contracts (Morph Holesky)</h4>
          {contracts.map((contract, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                {getStatusIcon(contract.status)}
                <div className="ml-2">
                  <span className="font-medium text-gray-800">{contract.name}</span>
                  {contract.address && (
                    <div className="text-xs text-gray-500 font-mono">
                      {contract.address.slice(0, 8)}...{contract.address.slice(-6)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(contract.status)}
                {contract.explorerUrl && (
                  <a 
                    href={contract.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Deployment Instructions */}
        {contracts.some(c => c.status === 'not-deployed') && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Ready to Deploy?</h4>
            <p className="text-sm text-blue-700 mb-3">
              Deploy smart contracts to enable full on-chain functionality
            </p>
            <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
              npx hardhat run scripts/deploy.js --network morphHolesky
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}