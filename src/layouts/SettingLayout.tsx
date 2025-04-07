import React from "react";
import Footer from "@/components/template/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";
import { Separator } from "@radix-ui/react-select";

export default function SettingLayout({ children, nav, setNav }: { children: React.ReactNode, nav: any, setNav: any }) {
    const sidebarNavItems: any = [
        {
            title: 'Connection',
            url: 'connection'
        },
        {
            title: 'User Management',
            url: 'user management'
        },
        {
            title: 'Misc.',
            url: 'misc'
        },
    ];
    return (
        <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
            <div className="flex flex-1 flex-col gap-2 pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Settings</h2>
                </div>

                <div className="px-4 py-6">

                    <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-48">
                            <nav className="flex flex-col space-y-1 space-x-0">
                                {sidebarNavItems.map((item: any) => (
                                    <Button
                                        key={item.url}
                                        size="sm"
                                        variant="ghost"
                                        className={cn('w-full justify-start', {
                                            'bg-muted': nav === item.url,
                                        })}
                                        onClick={() => setNav(item.url)}
                                    >
                                        {item.title}
                                    </Button>
                                ))}
                            </nav>
                        </aside>

                        <Separator className="my-6 md:hidden" />

                        <div className="flex-1 w-full">
                            <section className="w-full">{children}</section>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
