import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Bell, Check, ChevronRight, Home, Search, Settings, User } from 'lucide-react';

const DesignSystem = () => {
    return (
        <div className="min-h-screen bg-neutral-50 pb-24">
            <div className="bg-white border-b px-6 py-8 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Design System</h1>
                <p className="text-neutral-500">
                    A collection of reusable components and styles used across the Contigo Unido application.
                </p>
            </div>

            <div className="container mx-auto px-6 space-y-12 max-w-5xl">

                {/* Typography Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-neutral-900">Typography</h2>
                        <Badge variant="outline">Foundation</Badge>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">h1 / 2.25rem / Bold</p>
                                    <h1 className="text-4xl font-bold tracking-tight">The quick brown fox jumps over the lazy dog</h1>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">h2 / 1.875rem / Semibold</p>
                                    <h2 className="text-3xl font-semibold tracking-tight">The quick brown fox jumps over the lazy dog</h2>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">h3 / 1.5rem / Semibold</p>
                                    <h3 className="text-2xl font-semibold tracking-tight">The quick brown fox jumps over the lazy dog</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">h4 / 1.25rem / Semibold</p>
                                    <h4 className="text-xl font-semibold tracking-tight">The quick brown fox jumps over the lazy dog</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">p / 1rem / Regular</p>
                                    <p className="leading-7">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">small / 0.875rem / Medium</p>
                                    <small className="text-sm font-medium leading-none">The quick brown fox jumps over the lazy dog</small>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-neutral-400 font-mono">muted / 0.875rem / Regular</p>
                                    <p className="text-sm text-muted-foreground">The quick brown fox jumps over the lazy dog</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Colors Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-neutral-900">Colors</h2>
                        <Badge variant="outline">Foundation</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-primary shadow-sm" />
                            <div className="space-y-1">
                                <p className="font-medium">Primary</p>
                                <p className="text-xs text-muted-foreground">Brand Color</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-secondary shadow-sm" />
                            <div className="space-y-1">
                                <p className="font-medium">Secondary</p>
                                <p className="text-xs text-muted-foreground">Accent Color</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-destructive shadow-sm" />
                            <div className="space-y-1">
                                <p className="font-medium">Destructive</p>
                                <p className="text-xs text-muted-foreground">Error / Danger</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-muted shadow-sm" />
                            <div className="space-y-1">
                                <p className="font-medium">Muted</p>
                                <p className="text-xs text-muted-foreground">Backgrounds</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Primitives Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-neutral-900">Primitives</h2>
                        <Badge variant="outline">Components</Badge>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Buttons</CardTitle>
                                <CardDescription>Interactive elements for user actions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button>Default</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="link">Link</Button>
                                    <Button variant="destructive">Destructive</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Button size="sm">Small</Button>
                                    <Button size="default">Default</Button>
                                    <Button size="lg">Large</Button>
                                    <Button size="icon"><Settings className="h-4 w-4" /></Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button disabled>Disabled</Button>
                                    <Button>
                                        <Search className="mr-2 h-4 w-4" /> With Icon
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Badges */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Badges</CardTitle>
                                <CardDescription>Status indicators and labels.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                <Badge>Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="outline">Outline</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                                <Badge className="bg-emerald-500 hover:bg-emerald-600">Custom Success</Badge>
                                <Badge className="bg-amber-500 hover:bg-amber-600">Custom Warning</Badge>
                            </CardContent>
                        </Card>

                        {/* Avatars */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Avatars</CardTitle>
                                <CardDescription>User profile images and fallbacks.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4 items-center">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                                </Avatar>
                            </CardContent>
                        </Card>

                        {/* Loading Spinner */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Loading States</CardTitle>
                                <CardDescription>Indicators for async operations.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-8 items-center justify-center p-8">
                                <LoadingSpinner />
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Forms Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-neutral-900">Forms</h2>
                        <Badge variant="outline">Components</Badge>
                    </div>

                    <Card>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" placeholder="name@example.com" type="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="disabled">Disabled Input</Label>
                                    <Input id="disabled" disabled placeholder="Cannot type here" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms">Accept terms and conditions</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch id="airplane-mode" />
                                    <Label htmlFor="airplane-mode">Airplane Mode</Label>
                                </div>

                                <div className="space-y-2">
                                    <Label>Progress</Label>
                                    <Progress value={60} className="w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Feedback Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-neutral-900">Feedback</h2>
                        <Badge variant="outline">Components</Badge>
                    </div>

                    <div className="space-y-4">
                        <Alert>
                            <Settings className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                You can add components to your app using the cli.
                            </AlertDescription>
                        </Alert>

                        <Alert variant="destructive">
                            <Bell className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Your session has expired. Please log in again.
                            </AlertDescription>
                        </Alert>
                    </div>
                </section>

                {/* Cards Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-neutral-900">Cards</h2>
                        <Badge variant="outline">Components</Badge>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Card Title</CardTitle>
                                <CardDescription>Card Description</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Card Content</p>
                            </CardContent>
                            <CardFooter>
                                <p>Card Footer</p>
                            </CardFooter>
                        </Card>

                        <Card className="flex flex-col justify-between">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">User Profile</CardTitle>
                                        <CardDescription>@username</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    This is a profile card example with an avatar and user details.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="ghost" size="sm">Cancel</Button>
                                <Button size="sm">Follow</Button>
                            </CardFooter>
                        </Card>

                        <Card className="bg-neutral-900 text-white border-neutral-800">
                            <CardHeader>
                                <CardTitle className="text-white">Dark Card</CardTitle>
                                <CardDescription className="text-neutral-400">For special emphasis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-300">
                                    Used for hero sections or important call-to-actions.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full">Action</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default DesignSystem;
