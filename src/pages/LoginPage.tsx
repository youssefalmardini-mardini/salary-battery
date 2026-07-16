import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppLogo } from '@/components/AppLogo'

export function LoginPage() {
  const { session, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const { error: signInError } = await signInWithPassword(email, password)
    setIsSubmitting(false)
    if (signInError) {
      setError(signInError)
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex flex-col items-center gap-2">
        <AppLogo className="h-16 w-24 text-foreground" />
        <span className="font-heading text-lg font-medium">Salary Battery</span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
          <CardDescription>Track your monthly salary and savings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account yet?{' '}
            <Link to="/signup" className="font-medium text-foreground underline underline-offset-4">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
