/**
 * Component Showcase Page
 *
 * Visual demonstration of all UI components
 */

'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  PasswordInput,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert
} from '@/components/ui';

export default function ComponentShowcase() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Component Showcase
          </h1>
          <p className="text-gray-600">
            Visual demonstration of all UI components
          </p>
        </div>

        {/* Buttons */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different variants and sizes with loading states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Variants</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Sizes</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Loading State</p>
              <Button
                isLoading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
              >
                Click to Load
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Full Width</p>
              <Button fullWidth>Full Width Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Text inputs with labels, errors, and helper text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              helperText="We'll never share your email"
            />

            <Input
              label="With Error"
              value=""
              error="This field is required"
              placeholder="Enter something"
            />

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              showStrength
            />
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>
              Different severity levels for messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="info" title="Information">
              This is an informational message with some helpful context.
            </Alert>

            <Alert variant="success" title="Success">
              Your operation completed successfully!
            </Alert>

            <Alert variant="warning" title="Warning">
              Please be careful with this action. It may have consequences.
            </Alert>

            <Alert variant="danger" title="Error">
              Something went wrong. Please try again later.
            </Alert>

            <Alert variant="info">
              Alert without a title still works great!
            </Alert>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>
                White background with border
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This is the default card variant.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" fullWidth>
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>
                White background with shadow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This is the elevated card variant.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm" fullWidth>
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>
                Transparent with border
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This is the outlined card variant.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" fullWidth>
                Action
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Combination Example */}
        <Card variant="elevated" className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Form Example</CardTitle>
            <CardDescription>
              Combination of multiple components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="info">
              Demo form showing component integration
            </Alert>

            <Input
              label="Username"
              placeholder="Enter username"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              showStrength
            />

            <Button variant="primary" fullWidth>
              Sign In
            </Button>

            <Button variant="ghost" fullWidth>
              Forgot Password?
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
