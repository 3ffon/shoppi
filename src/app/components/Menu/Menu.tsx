"use client";
import * as React from 'react'
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
  Category as CategoryIcon,
  Checklist as ChecklistIcon,
  ShoppingCart as ShoppingCartIcon
} from "@mui/icons-material";
import { useLanguage } from '@/app/providers_tmp/LanguageProvider';
import style from './menu.module.css';
import { useRouter } from 'next/navigation';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function Menu({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  const { setMode } = useColorScheme();
  const { dictionary, locale, isRTL, setLocale } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  return (
    <Box className={style.menu_wrapper}>
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
          <Typography variant="h6" noWrap component="div" className={style.title}>
            {dictionary.app_title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer open={open} onClose={toggleDrawer(false)} ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}>
          <DrawerHeader>
            <IconButton onClick={toggleDrawer(false)}>
              {isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
          <ListItem onClick={() => {
              router.push('/');
              setOpen(false);
            }}>
              <ListItemButton>
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary={dictionary.shopping_list} />
              </ListItemButton>
            </ListItem>

            <ListItem onClick={() => {
              router.push('/products');
              setOpen(false);
            }}>
              <ListItemButton>
                <ListItemIcon>
                  <ChecklistIcon />
                </ListItemIcon>
                <ListItemText primary={dictionary.item_management} />
              </ListItemButton>
            </ListItem>

            <ListItem onClick={() => {
              router.push('/sections');
              setOpen(false);
            }}>
              <ListItemButton>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText primary={dictionary.section_management} />
              </ListItemButton>
            </ListItem>

            <Divider />
            <ListItem onClick={() => setLocale(locale === "he" ? "en" : "he")}>
              <ListItemButton>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary={locale === "he" ? "English" : "עברית"} />
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
      </nav>
      <Box className={style.main_wrapper} component="main">
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
