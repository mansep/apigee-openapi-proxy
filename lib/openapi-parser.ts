import yaml from "js-yaml"

export async function parseOpenApiSpec(content: string, fileType: string): Promise<any> {
  try {
    // Parse the content based on file type
    let parsedSpec

    if (fileType === "json") {
      parsedSpec = JSON.parse(content)
    } else if (["yaml", "yml"].includes(fileType)) {
      parsedSpec = yaml.load(content)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    // Validate that it's an OpenAPI spec
    if (!parsedSpec.openapi && !parsedSpec.swagger) {
      throw new Error("The file does not appear to be a valid OpenAPI specification")
    }

    return parsedSpec
  } catch (error) {
    console.error("Error parsing OpenAPI spec:", error)
    throw error
  }
}

