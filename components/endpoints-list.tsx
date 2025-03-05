"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import type { Endpoint } from "@/components/apigee-proxy-generator"

interface EndpointsListProps {
  endpoints: Endpoint[]
}

export default function EndpointsList({ endpoints }: EndpointsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEndpoints = endpoints.filter(
    (endpoint) =>
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (endpoint.operationId && endpoint.operationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (endpoint.summary && endpoint.summary.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  return (
    <div className="space-y-4">
      <div className="flex items-center border rounded-md px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input
          placeholder="Buscar endpoints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Método</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead className="hidden md:table-cell">ID de Operación</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEndpoints.length > 0 ? (
              filteredEndpoints.map((endpoint, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                  <TableCell className="hidden md:table-cell">{endpoint.operationId || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{endpoint.summary || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  {endpoints.length === 0
                    ? "No se encontraron endpoints. Por favor sube una definición OpenAPI."
                    : "No hay endpoints que coincidan con tu criterio de búsqueda."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

