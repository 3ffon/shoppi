"use client";
import * as React from 'react'
import Items from '../components/ProductList/items';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import CssBaseline from '@mui/material/CssBaseline';
import { useDictionary } from './DictionaryProvider';
import Cookies from "js-cookie";
import style from './page.module.css';
import { usePathname, useRouter } from 'next/navigation';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function Home({ }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { setMode } = useColorScheme();
  const { dictionary, locale } = useDictionary();
  const rtl = locale === 'he';
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setOpen(open);
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
    <Box className={style.page}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {dictionary.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <DrawerHeader>
          <IconButton onClick={toggleDrawer(false)}>
            {rtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem >
            <ListItemButton>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary={locale === "he" ? "English" : "עברית"} onClick={() => switchLocale(locale === "he" ? "en" : "he")} />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary={locale === "he" ? "English" : "עברית"} onClick={() => switchLocale(locale === "he" ? "en" : "he")} />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton onClick={() => setMode(theme.palette.mode === 'dark' ? 'light' : 'dark')}>
              <ListItemIcon>
                {theme.palette.mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText primary={theme.palette.mode === 'light' ? dictionary.dark_mode : dictionary.light_mode} />
            </ListItemButton>
          </ListItem>

        </List>

      </Drawer>
      <main>
        <Items />
      </main>
    </Box>
  );
}
