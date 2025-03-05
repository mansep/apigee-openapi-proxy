"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Code, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Endpoint, Policy, EndpointPolicy } from "@/components/apigee-proxy-generator"
import { generateApigeeProxy } from "@/lib/proxy-generator"
import { domains, getSubdomainsByDomainCode } from "@/lib/domains"

interface ProxyGeneratorProps {
  openApiSpec: any
  endpoints: Endpoint[]
  policies: Policy[]
  endpointPolicies: EndpointPolicy[]
}

export default function ProxyGenerator({ openApiSpec, endpoints, policies, endpointPolicies }: ProxyGeneratorProps) {
  const [proxyName, setProxyName] = useState("")
  const [basePath, setBasePath] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("")
  const [selectedSubdomain, setSelectedSubdomain] = useState("")
  const [availableSubdomains, setAvailableSubdomains] = useState<any[]>([])
  const [formattedProxyName, setFormattedProxyName] = useState("")
  const [generatedProxy, setGeneratedProxy] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Update available subdomains when domain changes
  useEffect(() => {
    if (selectedDomain) {
      setAvailableSubdomains(getSubdomainsByDomainCode(selectedDomain))
      setSelectedSubdomain("") // Reset subdomain when domain changes
    } else {
      setAvailableSubdomains([])
      setSelectedSubdomain("")
    }
  }, [selectedDomain])

  // Update formatted proxy name when any of the inputs change
  useEffect(() => {
    if (selectedSubdomain && proxyName) {
      setFormattedProxyName(`${selectedSubdomain}-${proxyName}-proxy`)
    } else {
      setFormattedProxyName("")
    }
  }, [selectedSubdomain, proxyName])

  const handleDomainChange = (value: string) => {
    setSelectedDomain(value)
  }

  const handleSubdomainChange = (value: string) => {
    setSelectedSubdomain(value)
  }

  const handleGenerate = async () => {
    if (!formattedProxyName) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    setIsGenerating(true)

    try {
      const proxyConfig = {
        name: formattedProxyName,
        basePath: basePath || "/",
        targetUrl: targetUrl || "https://api.example.com",
      }

      const proxyZip = await generateApigeeProxy(proxyConfig, openApiSpec, endpoints, policies, endpointPolicies)

      setGeneratedProxy(proxyZip)
    } catch (error) {
      console.error("Error generando proxy:", error)
      alert("Error generando proxy. Por favor revisa la consola para más detalles.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedProxy) return

    // Create a blob from the base64 string
    const byteCharacters = atob(generatedProxy)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "application/zip" })

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formattedProxyName}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Proxy</CardTitle>
          <CardDescription>Configura los ajustes básicos para tu proxy de Apigee</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="domain">Dominio</Label>
              <Select value={selectedDomain} onValueChange={handleDomainChange}>
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Selecciona un dominio" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.code} value={domain.code}>
                      {domain.name} ({domain.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdominio</Label>
              <Select value={selectedSubdomain} onValueChange={handleSubdomainChange} disabled={!selectedDomain}>
                <SelectTrigger id="subdomain">
                  <SelectValue placeholder="Selecciona un subdominio" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubdomains.map((subdomain) => (
                    <SelectItem key={subdomain.code} value={subdomain.code}>
                      {subdomain.name} ({subdomain.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proxy-name">Nombre del Proxy</Label>
            <Input
              id="proxy-name"
              placeholder="mi-api"
              value={proxyName}
              onChange={(e) => setProxyName(e.target.value)}
            />
            {formattedProxyName && (
              <p className="text-sm text-muted-foreground mt-1">
                Nombre formateado: <span className="font-mono">{formattedProxyName}</span>
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base-path">Ruta Base</Label>
              <Input id="base-path" placeholder="/v1" value={basePath} onChange={(e) => setBasePath(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-url">URL Destino</Label>
              <Input
                id="target-url"
                placeholder="https://api.example.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isGenerating || !formattedProxyName} className="w-full">
            {isGenerating ? "Generando..." : "Generar Proxy"}
          </Button>
        </CardFooter>
      </Card>

      {generatedProxy && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Proxy Generado Exitosamente</CardTitle>
              <CardDescription>Tu proxy de Apigee ha sido generado y está listo para descargar</CardDescription>
            </div>
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{formattedProxyName}.zip</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

