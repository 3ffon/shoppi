"use client";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from '@mui/material'
import { useColorScheme } from '@mui/material/styles';

export default function LocaleSwitcher() {
    const pathname = usePathname(); // Get the current path
    const router = useRouter(); // Programmatic navigation
   
    const { setMode } = useColorScheme();

    const changeTheme = (theme: 'dark' | 'light') => {
        setMode(theme);
    };

    const switchLocale = (newLocale: string) => {
        // Set the new locale in cookies
        Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 });

        // Replace the locale in the current path
        const pathSegments = pathname.split("/");
        if (pathSegments[1]) {
            pathSegments[1] = newLocale; // Replace the locale
        } else {
            pathSegments.unshift(newLocale); // Add the locale if not present
        }

        const newPathname = pathSegments.join("/");

        // Redirect to the updated path
        router.push(newPathname);
    };

    return (
        <div>
            <div>
                <Button onClick={() => switchLocale("he")} variant="outlined">עברית</Button>
                <Button onClick={() => switchLocale("en")} variant="outlined">English</Button>
            </div>
            <div>
                <Button onClick={() => changeTheme('dark')} variant="outlined">Dark</Button>
                <Button onClick={() => changeTheme('light')} variant="outlined">Light</Button>
            </div>
        </div>
    );
}