"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import FileUploader from "@/components/file-uploader"
import EndpointsList from "@/components/endpoints-list"
import PolicyManager from "@/components/policy-manager"
import ProxyGenerator from "@/components/proxy-generator"
import StepIndicator from "@/components/step-indicator"
import { parseOpenApiSpec } from "@/lib/openapi-parser"
import { parsePolicyXml } from "@/lib/policy-parser"
import { Button } from "@/components/ui/button"

export type Endpoint = {
  path: string
  method: string
  operationId?: string
  summary?: string
}

export type Policy = {
  name: string
  type: string
  content: string
  fileName: string
}

export type EndpointPolicy = {
  endpointId: string
  policyId: string
  flow: "preflow" | "postflow"
}

export default function ApigeeProxyGenerator() {
  const [openApiSpec, setOpenApiSpec] = useState<any>(null)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [endpointPolicies, setEndpointPolicies] = useState<EndpointPolicy[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [openApiUploaded, setOpenApiUploaded] = useState(false)
  const [policyUploaded, setPolicyUploaded] = useState(false)

  const steps = ["Cargar Archivos", "Endpoints", "Políticas", "Generar Proxy"]
  const stepValues = ["upload", "endpoints", "policies", "generate"]
  const currentStepIndex = stepValues.indexOf(activeTab)

  const handleOpenApiUpload = async (file: File) => {
    try {
      const fileContent = await readFileAsText(file)
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      const parsedSpec = await parseOpenApiSpec(fileContent, fileExtension as string)
      setOpenApiSpec(parsedSpec)

      const extractedEndpoints = extractEndpoints(parsedSpec)
      setEndpoints(extractedEndpoints)
      setOpenApiUploaded(true)
    } catch (error) {
      console.error("Error procesando archivo OpenAPI:", error)
      alert("Error procesando archivo OpenAPI. Por favor revise la consola para más detalles.")
    }
  }

  const handlePolicyUpload = async (file: File) => {
    try {
      const fileContent = await readFileAsText(file)
      const policyName = file.name.replace(/\.xml$/, "")

      const parsedPolicy = await parsePolicyXml(fileContent)

      // Add the new policy to the list
      setPolicies([
        ...policies,
        {
          name: policyName,
          type: parsedPolicy.type || "unknown",
          content: fileContent,
          fileName: file.name,
        },
      ])
      setPolicyUploaded(true)
    } catch (error) {
      console.error("Error procesando archivo de política:", error)
      alert("Error procesando archivo de política. Por favor revise la consola para más detalles.")
    }
  }

  const handleAssignPolicy = (endpointId: string, policyId: string, flow: "preflow" | "postflow") => {
    // Check if this assignment already exists
    const existingAssignment = endpointPolicies.find(
      (ep) => ep.endpointId === endpointId && ep.policyId === policyId && ep.flow === flow,
    )

    if (existingAssignment) {
      // Remove the assignment if it exists
      setEndpointPolicies(
        endpointPolicies.filter(
          (ep) => !(ep.endpointId === endpointId && ep.policyId === policyId && ep.flow === flow),
        ),
      )
    } else {
      // Add the new assignment
      setEndpointPolicies([...endpointPolicies, { endpointId, policyId, flow }])
    }
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target?.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  const extractEndpoints = (spec: any): Endpoint[] => {
    const endpoints: Endpoint[] = []

    if (!spec || !spec.paths) return endpoints

    Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (["get", "post", "put", "delete", "patch", "options", "head"].includes(method)) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: operation.operationId,
            summary: operation.summary || `${method.toUpperCase()} ${path}`,
          })
        }
      })
    })

    return endpoints
  }

  const navigateToStep = (step: string) => {
    setActiveTab(step)
  }

  // Updated condition for continuing from upload
  const canContinueFromUpload = openApiUploaded && endpoints.length > 0

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStepIndex} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="upload">Cargar Archivos</TabsTrigger>
          <TabsTrigger value="endpoints" disabled={!canContinueFromUpload}>
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="policies" disabled={!canContinueFromUpload}>
            Políticas
          </TabsTrigger>
          <TabsTrigger value="generate" disabled={!canContinueFromUpload}>
            Generar Proxy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Cargar Archivos</CardTitle>
              {/* Updated message for file upload screen */}
              <CardDescription>Sube tu definición OpenAPI y opcionalmente archivos de políticas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FileUploader
                  title="Subir Definición OpenAPI"
                  description="Sube un archivo YAML o JSON con tu definición OpenAPI"
                  acceptedFileTypes=".yaml,.yml,.json"
                  onFileUpload={handleOpenApiUpload}
                />

                <FileUploader
                  title="Subir Políticas XML"
                  description="Sube archivos XML que contienen políticas de Apigee"
                  acceptedFileTypes=".xml"
                  onFileUpload={handlePolicyUpload}
                  multiple={true}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigateToStep("endpoints")} disabled={!canContinueFromUpload}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
              <CardDescription>Revisa los endpoints de tu definición OpenAPI</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <EndpointsList endpoints={endpoints} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigateToStep("upload")}>
                Atrás
              </Button>
              <Button onClick={() => navigateToStep("policies")}>Continuar</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Políticas</CardTitle>
              <CardDescription>Asigna políticas a tus endpoints</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PolicyManager
                endpoints={endpoints}
                policies={policies}
                endpointPolicies={endpointPolicies}
                onAssignPolicy={handleAssignPolicy}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigateToStep("endpoints")}>
                Atrás
              </Button>
              <Button onClick={() => navigateToStep("generate")}>Continuar</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generar Proxy</CardTitle>
              <CardDescription>Configura y genera tu proxy de Apigee</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ProxyGenerator
                openApiSpec={openApiSpec}
                endpoints={endpoints}
                policies={policies}
                endpointPolicies={endpointPolicies}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigateToStep("policies")}>
                Atrás
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

