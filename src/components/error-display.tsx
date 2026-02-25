"use client";

import { AlertCircle, RefreshCw, WifiOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  code?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  code,
  message,
  details,
  onRetry,
}: ErrorDisplayProps) {
  const getIcon = () => {
    switch (code) {
      case "NETWORK_ERROR":
        return <WifiOff className="h-8 w-8 text-destructive" />;
      case "HTTP_401":
      case "HTTP_403":
        return <ShieldAlert className="h-8 w-8 text-destructive" />;
      default:
        return <AlertCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (code) {
      case "NETWORK_ERROR":
        return "Connection Error";
      case "HTTP_401":
        return "Authentication Required";
      case "HTTP_403":
        return "Access Denied";
      case "HTTP_429":
        return "Too Many Requests";
      case "HTTP_500":
        return "Server Error";
      default:
        return "Something Went Wrong";
    }
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {getIcon()}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">
              {getTitle()}
            </h3>
            <p className="text-sm text-muted-foreground">{message}</p>
            {details && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Technical details
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
                  {details}
                </pre>
              </details>
            )}
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
