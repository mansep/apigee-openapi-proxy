"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, FileCode, ChevronDown, ChevronUp } from "lucide-react"
import type { Endpoint, Policy, EndpointPolicy } from "@/components/apigee-proxy-generator"

interface PolicyManagerProps {
  endpoints: Endpoint[]
  policies: Policy[]
  endpointPolicies: EndpointPolicy[]
  onAssignPolicy: (endpointId: string, policyId: string, flow: "preflow" | "postflow") => void
}

export default function PolicyManager({ endpoints, policies, endpointPolicies, onAssignPolicy }: PolicyManagerProps) {
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({})
  const [globalFlow, setGlobalFlow] = useState<"preflow" | "postflow">("preflow")

  const getEndpointId = (endpoint: Endpoint): string => {
    return `${endpoint.method}-${endpoint.path}`
  }

  const isPolicyAssigned = (endpointId: string, policyId: string, flow: "preflow" | "postflow"): boolean => {
    return endpointPolicies.some((ep) => ep.endpointId === endpointId && ep.policyId === policyId && ep.flow === flow)
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      POST: "bg-green-100 text-green-800 hover:bg-green-100",
      PUT: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      DELETE: "bg-red-100 text-red-800 hover:bg-red-100",
      PATCH: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      OPTIONS: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      HEAD: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return colors[method] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  const getPolicyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      security: "bg-red-100 text-red-800",
      mediation: "bg-blue-100 text-blue-800",
      extension: "bg-purple-100 text-purple-800",
      "traffic-management": "bg-yellow-100 text-yellow-800",
      unknown: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors["unknown"]
  }

  const toggleEndpointExpanded = (endpointId: string) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [endpointId]: !prev[endpointId],
    }))
  }

  const getAssignedPolicies = (endpointId: string, flow: "preflow" | "postflow") => {
    return endpointPolicies
      .filter((ep) => ep.endpointId === endpointId && ep.flow === flow)
      .map((ep) => {
        const policy = policies.find((p) => p.name === ep.policyId)
        return policy
      })
      .filter(Boolean) as Policy[]
  }

  // Nueva función para asignar una política a todos los endpoints
  const assignPolicyToAllEndpoints = (policyId: string, flow: "preflow" | "postflow") => {
    endpoints.forEach((endpoint) => {
      const endpointId = getEndpointId(endpoint)
      if (!isPolicyAssigned(endpointId, policyId, flow)) {
        onAssignPolicy(endpointId, policyId, flow)
      }
    })
  }

  return (
    <div className="space-y-6">
      {policies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Asignar Políticas a Todos los Endpoints</CardTitle>
            <CardDescription>Selecciona políticas para aplicar a todos los endpoints a la vez</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Tabs value={globalFlow} onValueChange={(value) => setGlobalFlow(value as "preflow" | "postflow")}>
                <TabsList className="w-full">
                  <TabsTrigger value="preflow" className="flex-1">
                    PreFlow
                  </TabsTrigger>
                  <TabsTrigger value="postflow" className="flex-1">
                    PostFlow
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-[100px] text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.length > 0 ? (
                    policies.map((policy, pIndex) => (
                      <TableRow key={pIndex}>
                        <TableCell>{policy.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPolicyTypeColor(policy.type)}>
                            {policy.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assignPolicyToAllEndpoints(policy.name, globalFlow)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar a Todos
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No hay políticas disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {endpoints.length === 0 ? (
        <div className="rounded-md border p-6 text-center">
          <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay endpoints disponibles</h3>
          <p className="text-sm text-muted-foreground">Por favor sube una definición OpenAPI para ver los endpoints.</p>
        </div>
      ) : (
        endpoints.map((endpoint, index) => {
          const endpointId = getEndpointId(endpoint)
          const isExpanded = expandedEndpoints[endpointId] || false

          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer flex flex-row items-center justify-between p-4"
                onClick={() => toggleEndpointExpanded(endpointId)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                    <CardTitle className="text-lg font-mono">{endpoint.path}</CardTitle>
                  </div>
                  {endpoint.operationId && <CardDescription>ID de Operación: {endpoint.operationId}</CardDescription>}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-0">
                  <Tabs defaultValue="preflow" className="w-full">
                    <TabsList className="w-full rounded-none">
                      <TabsTrigger value="preflow" className="flex-1">
                        PreFlow
                      </TabsTrigger>
                      <TabsTrigger value="postflow" className="flex-1">
                        PostFlow
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preflow" className="p-4 pt-6">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Políticas Asignadas</h4>
                        <div className="rounded-md border">
                          {getAssignedPolicies(endpointId, "preflow").length > 0 ? (
                            <div className="divide-y">
                              {getAssignedPolicies(endpointId, "preflow").map((policy, pIndex) => (
                                <div key={pIndex} className="flex items-center justify-between p-3">
                                  <div className="flex items-center gap-2">
                                    <span>{policy.name}</span>
                                    <Badge variant="outline" className={getPolicyTypeColor(policy.type)}>
                                      {policy.type}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onAssignPolicy(endpointId, policy.name, "preflow")}
                                  >
                                    <Minus className="h-4 w-4 mr-1" />
                                    Quitar
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              No hay políticas asignadas al PreFlow
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Políticas Disponibles</h4>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="w-[100px] text-right">Acción</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {policies.length > 0 ? (
                                policies
                                  .filter((policy) => !isPolicyAssigned(endpointId, policy.name, "preflow"))
                                  .map((policy, pIndex) => (
                                    <TableRow key={pIndex}>
                                      <TableCell>{policy.name}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className={getPolicyTypeColor(policy.type)}>
                                          {policy.type}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onAssignPolicy(endpointId, policy.name, "preflow")}
                                        >
                                          <Plus className="h-4 w-4 mr-1" />
                                          Agregar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                    No hay políticas disponibles
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="postflow" className="p-4 pt-6">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Políticas Asignadas</h4>
                        <div className="rounded-md border">
                          {getAssignedPolicies(endpointId, "postflow").length > 0 ? (
                            <div className="divide-y">
                              {getAssignedPolicies(endpointId, "postflow").map((policy, pIndex) => (
                                <div key={pIndex} className="flex items-center justify-between p-3">
                                  <div className="flex items-center gap-2">
                                    <span>{policy.name}</span>
                                    <Badge variant="outline" className={getPolicyTypeColor(policy.type)}>
                                      {policy.type}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onAssignPolicy(endpointId, policy.name, "postflow")}
                                  >
                                    <Minus className="h-4 w-4 mr-1" />
                                    Quitar
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              No hay políticas asignadas al PostFlow
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Políticas Disponibles</h4>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="w-[100px] text-right">Acción</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {policies.length > 0 ? (
                                policies
                                  .filter((policy) => !isPolicyAssigned(endpointId, policy.name, "postflow"))
                                  .map((policy, pIndex) => (
                                    <TableRow key={pIndex}>
                                      <TableCell>{policy.name}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className={getPolicyTypeColor(policy.type)}>
                                          {policy.type}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onAssignPolicy(endpointId, policy.name, "postflow")}
                                        >
                                          <Plus className="h-4 w-4 mr-1" />
                                          Agregar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                    No hay políticas disponibles
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          )
        })
      )}

      {endpoints.length > 0 && policies.length === 0 && (
        <div className="rounded-md border p-6 text-center mt-4">
          <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay políticas disponibles</h3>
          <p className="text-sm text-muted-foreground">
            Por favor sube archivos XML de políticas para asignarlas a los endpoints.
          </p>
        </div>
      )}
    </div>
  )
}

