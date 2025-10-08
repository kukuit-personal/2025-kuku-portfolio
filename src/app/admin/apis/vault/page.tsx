'use client'

import { useEffect, useState } from 'react'

interface VaultConfig {
  baseUrl: string
  apiVersion: string
  sessionId: string
  name: string
  type: string
  subtype: string
  classification: string
}

export default function VaultPage() {
  const [config, setConfig] = useState<VaultConfig>({
    baseUrl: 'https://vv-agency.veevavault.com',
    apiVersion: 'v25.2',
    sessionId: '00Di0000000abc1!AQEAz3kP2X5Y6Z7a8b9cD_eFgHiJkLmNoPq',
    name: 'Email Template - Autumn Promo',
    type: 'promotional_piece__c',
    subtype: 'approved_email__c',
    classification: 'html_zip__c',
  })
  const [file, setFile] = useState<File | null>(null)
  const [notice, setNotice] = useState<string>('')

  // load config từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vault-config')
    if (saved) setConfig(JSON.parse(saved))
  }, [])

  // save config
  function saveConfig() {
    localStorage.setItem('vault-config', JSON.stringify(config))
    setNotice('Saved config ✔')
  }

  async function handleUpload() {
    if (!file) {
      setNotice('Connect to Vault successfully!')
      return
    }
    setNotice('⏳ Uploading...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('config', JSON.stringify(config))

      const res = await fetch('/api/promomats/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setNotice(`✅ Uploaded! Document Id: ${data.documentId}`)
    } catch (err: any) {
      console.error(err)
      setNotice(`❌ Upload failed: ${err.message}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Connect to Vault (PromoMats)</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-600">Vault Base URL</label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            placeholder="https://myvault.veevavault.com"
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">API Version</label>
          <input
            type="text"
            value={config.apiVersion}
            onChange={(e) => setConfig({ ...config, apiVersion: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-600">Session ID</label>
          <input
            type="password"
            value={config.sessionId}
            onChange={(e) => setConfig({ ...config, sessionId: e.target.value })}
            placeholder="Vault session ID"
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-600">Document Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Type</label>
          <input
            type="text"
            value={config.type}
            onChange={(e) => setConfig({ ...config, type: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Subtype</label>
          <input
            type="text"
            value={config.subtype}
            onChange={(e) => setConfig({ ...config, subtype: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Classification</label>
          <input
            type="text"
            value={config.classification}
            onChange={(e) => setConfig({ ...config, classification: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={saveConfig}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          💾 Save Config
        </button>
        <button
          onClick={handleUpload}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          ⬆ Test Connection
        </button>
      </div>

      {notice && <div className="text-sm text-slate-700">{notice}</div>}
    </div>
  )
}
