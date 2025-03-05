import { CheckCircle } from "lucide-react"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex items-center">
              {index > 0 && (
                <div
                  className={`h-1 w-full ${index <= currentStep ? "bg-primary" : "bg-gray-200"}`}
                  style={{ width: "100%" }}
                />
              )}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep
                    ? "bg-primary text-white"
                    : index === currentStep
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-gray-200 text-gray-400"
                }`}
              >
                {index < currentStep ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-full ${index < currentStep ? "bg-primary" : "bg-gray-200"}`}
                  style={{ width: "100%" }}
                />
              )}
            </div>
            <span className={`text-xs mt-2 ${index === currentStep ? "text-primary font-medium" : "text-gray-500"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

