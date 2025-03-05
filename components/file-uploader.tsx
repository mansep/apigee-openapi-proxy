"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  title: string
  description: string
  acceptedFileTypes: string
  onFileUpload: (file: File) => void
  multiple?: boolean
}

export default function FileUploader({
  title,
  description,
  acceptedFileTypes,
  onFileUpload,
  multiple = false,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles])

      // Process each file
      acceptedFiles.forEach((file) => {
        onFileUpload(file)
      })
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.split(",").reduce(
      (acc, type) => {
        acc[type] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
    multiple,
  })

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-center text-muted-foreground">{description}</p>
        <p className="text-xs text-center text-muted-foreground mt-1">Arrastra y suelta o haz clic para explorar</p>
        <Button variant="outline" className="mt-4">
          Seleccionar Archivo{multiple ? "s" : ""}
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Archivos Subidos:</h4>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

