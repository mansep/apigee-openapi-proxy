import JSZip from "jszip"

interface ProxyConfig {
  name: string
  basePath: string
  targetUrl: string
}

export async function generateApigeeProxy(
  config: ProxyConfig,
  openApiSpec: any,
  endpoints: any[],
  policies: any[],
  endpointPolicies: any[],
): Promise<string> {
  try {
    const zip = new JSZip()

    // Create the basic proxy structure
    const proxyRoot = zip.folder(config.name)
    const apiProxyFolder = proxyRoot?.folder("apiproxy")

    // Create the main folders
    const policiesFolder = apiProxyFolder?.folder("policies")
    const proxiesFolder = apiProxyFolder?.folder("proxies")
    const targetsFolder = apiProxyFolder?.folder("targets")

    // Create the main proxy XML file
    const proxyXml = generateProxyXml(config, openApiSpec)
    apiProxyFolder?.file(`${config.name}.xml`, proxyXml)

    // Create the default.xml file in proxies folder
    const proxyEndpointXml = generateProxyEndpointXml(config, endpoints, endpointPolicies)
    proxiesFolder?.file("default.xml", proxyEndpointXml)

    // Create the default.xml file in targets folder
    const targetEndpointXml = generateTargetEndpointXml(config)
    targetsFolder?.file("default.xml", targetEndpointXml)

    // Add all policies
    for (const policy of policies) {
      policiesFolder?.file(`${policy.name}.xml`, policy.content)
    }

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "base64" })
    return zipBlob
  } catch (error) {
    console.error("Error generando proxy de Apigee:", error)
    throw error
  }
}

function generateProxyXml(config: ProxyConfig, openApiSpec: any): string {
  const title = openApiSpec?.info?.title || config.name
  const description = openApiSpec?.info?.description || `Proxy generado para ${config.name}`
  const version = openApiSpec?.info?.version || "1.0.0"

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<APIProxy name="${config.name}">
    <Description>${description}</Description>
    <DisplayName>${title}</DisplayName>
    <Version>${version}</Version>
    <BasePaths>
        <BasePath>${config.basePath}</BasePath>
    </BasePaths>
    <ProxyEndpoints>
        <ProxyEndpoint>default</ProxyEndpoint>
    </ProxyEndpoints>
    <TargetEndpoints>
        <TargetEndpoint>default</TargetEndpoint>
    </TargetEndpoints>
</APIProxy>`
}

function generateProxyEndpointXml(config: ProxyConfig, endpoints: any[], endpointPolicies: any[]): string {
  // Group policies by endpoint and flow
  const policyMap: Record<string, Record<string, string[]>> = {}

  for (const ep of endpointPolicies) {
    if (!policyMap[ep.endpointId]) {
      policyMap[ep.endpointId] = { preflow: [], postflow: [] }
    }
    policyMap[ep.endpointId][ep.flow].push(ep.policyId)
  }

  // Generate flows for each endpoint
  let flowsXml = ""

  for (const endpoint of endpoints) {
    const endpointId = `${endpoint.method}-${endpoint.path}`
    const policies = policyMap[endpointId] || { preflow: [], postflow: [] }

    const preflowSteps = policies.preflow
      .map((policy) => `<Step><Name>${policy}</Name></Step>`)
      .join("\n                ")

    const postflowSteps = policies.postflow
      .map((policy) => `<Step><Name>${policy}</Name></Step>`)
      .join("\n                ")

    flowsXml += `
        <Flow name="${endpoint.operationId || `${endpoint.method}-${endpoint.path}`}">
            <Description>${endpoint.summary || `${endpoint.method} ${endpoint.path}`}</Description>
            <Request>
                ${preflowSteps}
            </Request>
            <Response>
                ${postflowSteps}
            </Response>
            <Condition>(proxy.pathsuffix MatchesPath "${endpoint.path}") and (request.verb = "${endpoint.method}")</Condition>
        </Flow>`
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ProxyEndpoint name="default">
    <Description>Endpoint Proxy Predeterminado</Description>
    <PreFlow name="PreFlow">
        <Request/>
        <Response/>
    </PreFlow>
    <Flows>${flowsXml}
    </Flows>
    <PostFlow name="PostFlow">
        <Request/>
        <Response/>
    </PostFlow>
    <HTTPProxyConnection>
        <BasePath>${config.basePath}</BasePath>
    </HTTPProxyConnection>
    <RouteRule name="default">
        <TargetEndpoint>default</TargetEndpoint>
    </RouteRule>
</ProxyEndpoint>`
}

function generateTargetEndpointXml(config: ProxyConfig): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<TargetEndpoint name="default">
    <Description>Endpoint Destino Predeterminado</Description>
    <PreFlow name="PreFlow">
        <Request/>
        <Response/>
    </PreFlow>
    <Flows/>
    <PostFlow name="PostFlow">
        <Request/>
        <Response/>
    </PostFlow>
    <HTTPTargetConnection>
        <URL>${config.targetUrl}</URL>
    </HTTPTargetConnection>
</TargetEndpoint>`
}

