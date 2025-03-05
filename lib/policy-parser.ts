import { XMLParser } from "fast-xml-parser"

export async function parsePolicyXml(content: string): Promise<any> {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    })

    const result = parser.parse(content)

    // Try to determine the policy type based on the root element
    let policyType = "unknown"

    const rootElement = Object.keys(result)[0]

    // Map common Apigee policy root elements to policy types
    const policyTypeMap: Record<string, string> = {
      OAuthV2: "security",
      VerifyAPIKey: "security",
      SpikeArrest: "traffic-management",
      QuotaPolicy: "traffic-management",
      RaiseFault: "mediation",
      AssignMessage: "mediation",
      JavaScript: "extension",
      ExtractVariables: "mediation",
      AccessControl: "security",
      BasicAuthentication: "security",
      JSONThreatProtection: "security",
      XMLThreatProtection: "security",
      RegularExpressionProtection: "security",
      CachePolicy: "traffic-management",
      ResponseCache: "traffic-management",
      KeyValueMapOperations: "extension",
      MessageLogging: "extension",
      ServiceCallout: "extension",
      XMLToJSON: "mediation",
      JSONToXML: "mediation",
      XSLTransform: "mediation",
    }

    if (rootElement && policyTypeMap[rootElement]) {
      policyType = policyTypeMap[rootElement]
    }

    return {
      type: policyType,
      content: result,
    }
  } catch (error) {
    console.error("Error parsing policy XML:", error)
    throw error
  }
}

