"use client"

import React, { useEffect, useCallback } from 'react'
import {
    Box,
    Button,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    MenuItem,
    TextField,
    Menu,
    Dialog,
    DialogActions,
    DialogTitle,
    Badge,
    Checkbox
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import {
    Clear as ClearIcon,
    DeleteOutlined as DeleteIcon,
    DeleteSweep as DeleteSweepIcon,
    CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';

import style from './page.module.css';
import { CartItemInterface } from './lib/interfaces';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import { debounce } from 'lodash';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useDB } from '@/app/providers/DBProvider';
import { useDeviceDetect } from '@/app/hooks/useDeviceDetect';

interface ItemProps {
    item: CartItemInterface;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
}

function Item({ ...props }: ItemProps) {
    const {
        isDragging,
        setIsDragging,
    } = props;

    
    const { dictionary } = useLanguage();
    const { sections, products, removeCartItem, updateCartItem } = useDB();
    const section = sections[products[props.item.id].section];

    const [item, setItem] = React.useState(props.item);

    useEffect(() => {
        setItem(props.item);
    }, [props.item]);

    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [isSwiped, setIsSwiped] = React.useState(false);
    const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);

    const x = useMotionValue(0);
    const buttonWidth = useTransform(x, [0, 100], [0, 70]);

    const handleDragEnd = (event: TouchEvent | MouseEvent | PointerEvent, info: PanInfo) => {
        resetSwipeState(info.offset.x > 100);
    };

    const [startCoords, setStartCoords] = React.useState({ x: 0, y: 0 });

    const handleTouchStart = (event: React.TouchEvent) => {
        setStartCoords({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        const timer = setTimeout(() => {
            
        }, 500);
        setLongPressTimer(timer);
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;

        if (Math.abs(currentX - startCoords.x) > 1 && Math.abs(currentY - startCoords.y) > 1) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                setLongPressTimer(null);
            }
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    useEffect(() => {
        document.addEventListener('click', () => resetSwipeState());
        return () => document.removeEventListener('click', () => resetSwipeState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSwiped, x]);

    const resetSwipeState = (state = false) => {
        setIsSwiped(state);
        setIsDragging(state);
        animate(x, state ? 100 : 0, { type: "spring", stiffness: 300, damping: 30 });
    };

    const toggleChecked = async () => {
        const updatedItem = {
            ...item,
            checked: !item.checked
        };
        setItem(updatedItem);
        await updateCartItem(updatedItem);
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null,
        );
    };

    const handleContextMenuClose = () => {
        setContextMenu(null);
    };

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 70 }}
                onDragEnd={handleDragEnd}
                dragElastic={0.2}
                dragMomentum={false}
                style={{ x }} // Applies translation to both elements
                onClick={(e) => e.stopPropagation()}
            >
                <ListItem key={`item-${section}-${item.id}`}>
                    <ListItemButton
                        sx={{
                            fontWeight: 'bold',
                            justifyContent: "space-between",
                            opacity: item.checked ? 0.6 : 1,
                            textDecoration: item.checked ? 'line-through' : 'none',
                        }}
                        onContextMenu={handleContextMenu}
                        onClick={(e) => {
                            if (isSwiped || isDragging) {
                                return e.stopPropagation();
                            }
                            toggleChecked();
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                    >
                        <div style={{ display: 'grid' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {products[item.id].name}
                                
                            </div>
                            <small>{section ? section.name : dictionary.no_section}</small>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 100}}>
                            <Badge 
                                badgeContent={item.quantity} 
                                color="success" 
                                sx={{ ml: 5 }}
                            />
                            <Checkbox
                                sx={{
                                    pointerEvents: "none",
                                }}
                                checked={item.checked}
                            />
                        </div>
                    </ListItemButton>
                    <Menu
                        open={contextMenu !== null}
                        onClose={handleContextMenuClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            contextMenu !== null
                                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                : undefined
                        }
                    >
                        <MenuItem onClick={async () => {
                            setOpenDeleteDialog(true);
                            handleContextMenuClose();
                        }}>{dictionary.delete_btn}</MenuItem>
                    </Menu>
                </ListItem>
            </motion.div>

            <motion.div
                className={style.delete_button_wrapper}
                style={{
                    width: buttonWidth,
                    pointerEvents: isSwiped ? 'auto' : 'none',
                }}
            >
                <Button
                    className={style.delete_button}
                    variant="contained"
                    color="error"
                    onClick={async () => {
                        setOpenDeleteDialog(true);
                    }}
                >
                    <DeleteIcon />
                </Button>
            </motion.div>
            <Dialog
                open={openDeleteDialog}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    resetSwipeState();
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {dictionary.dialog_delete_txt} {products[item.id].name} {dictionary.from_cart}?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDeleteDialog(false);
                        resetSwipeState();
                    }}>{dictionary.cancel_btn}</Button>
                    <Button onClick={async () => {
                        await removeCartItem(item.id);
                        setOpenDeleteDialog(false);
                    }} autoFocus>
                        {dictionary.confirm_btn}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default function Home() {
    const theme = useTheme();
    const { dictionary } = useLanguage();
    const { products, mainCart, removeCartItem, sections } = useDB();
    const [searctInput, setSearchInput] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [isDragging, setIsDragging] = React.useState(false);
    const [openClearCartDialog, setOpenClearCartDialog] = React.useState(false);
    const [openClearCheckedDialog, setOpenClearCheckedDialog] = React.useState(false);
    const { isIOS } = useDeviceDetect();
    
    // Filter products / section by search
    const filteredProducts = Object.values(mainCart.products).filter((product: Partial<CartItemInterface>) => {
        return products[product.id as string]?.name?.toLowerCase().includes(search.toLowerCase()) ||
            sections[products[product.id as string]?.section as string]?.name?.toLowerCase().includes(search.toLowerCase());
    });
    
    // Sort products: unchecked items first, then checked items
    // then, sort by section order, then by name
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (a.checked === b.checked) {
            // If checked status is the same, sort by section order, then by name
            return (sections[products[a.id as string]?.section as string]?.order ?? 999) - (sections[products[b.id as string]?.section as string]?.order ?? 999) ||
                products[a.id as string]?.name.localeCompare(products[b.id as string]?.name) || 0;
        }

        // Sort by checked status (unchecked first)
        return a.checked ? 1 : -1;
    });

    // Get checked items
    const checkedItems = sortedProducts.filter(item => item.checked);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetSearch = useCallback(debounce(setSearch, 150), []);

    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        }
    }, [debouncedSetSearch]);

    // Function to clear all items from cart
    const clearCart = async () => {
        for (const item of Object.values(mainCart.products)) {
            await removeCartItem(item.id);
        }
        setOpenClearCartDialog(false);
    };

    // Function to clear checked items from cart
    const clearCheckedItems = async () => {
        for (const item of checkedItems) {
            await removeCartItem(item.id);
        }
        setOpenClearCheckedDialog(false);
    };
    
    return (
        <div className={style.component_wrapper}>
            <div className={style.search_wrapper}>
                <TextField
                    id="item-search"
                    label={dictionary.search_input}
                    variant="outlined"
                    className={style.search}
                    value={searctInput}
                    autoComplete='off'
                    slotProps={{
                        input: {
                            endAdornment: search.length > 0 && <InputAdornment position="end">
                                <ClearIcon sx={{ cursor: 'pointer' }} onClick={() => {
                                    setSearch('')
                                    setSearchInput('')
                                }} />
                            </InputAdornment>
                        },
                    }}
                    onChange={e => {
                        setSearchInput(e.target.value);
                        debouncedSetSearch(e.target.value);
                    }}
                />
            </div>

            <div className={style.list_wrapper}>
                <List
                    className={style.list}
                    subheader={<li />}
                    dense
                >
                    <AnimatePresence mode="sync">
                        {sortedProducts.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    backgroundColor: {
                                        duration: 1,
                                        ease: "easeOut"
                                    }
                                }}
                            >
                                <Item
                                    key={item.id}
                                    item={item}
                                    isDragging={isDragging}
                                    setIsDragging={setIsDragging}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            </div>
            
            {/* Bottom Bar */}
            <div className={style.bottom_bar + ' ' + theme.palette.mode + (isIOS ? ' is-ios' : '')}>
                <Button 
                    variant="contained" 
                    color="secondary"
                    className={style.bottom_bar_button}
                    onClick={() => setOpenClearCheckedDialog(true)}
                    disabled={checkedItems.length === 0}
                    startIcon={<CheckCircleOutlineIcon />}
                >
                    {dictionary.clear_checked} {checkedItems.length ? `(${checkedItems.length})` : ''}
                </Button>
                <Button 
                    variant="contained" 
                    color="error"
                    className={style.bottom_bar_button}
                    onClick={() => setOpenClearCartDialog(true)}
                    disabled={sortedProducts.length === 0}
                    startIcon={<DeleteSweepIcon />}
                >
                    {dictionary.clear_cart} {sortedProducts.length ? `(${sortedProducts.length})` : ''}
                </Button>
            </div>

            {/* Clear Cart Confirmation Dialog */}
            <Dialog
                open={openClearCartDialog}
                onClose={() => setOpenClearCartDialog(false)}
                aria-labelledby="clear-cart-dialog-title"
            >
                <DialogTitle id="clear-cart-dialog-title">
                    {dictionary.confirm_clear_cart}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenClearCartDialog(false)}>
                        {dictionary.cancel_btn}
                    </Button>
                    <Button onClick={clearCart} color="error" autoFocus>
                        {dictionary.confirm_btn}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Clear Checked Items Confirmation Dialog */}
            <Dialog
                open={openClearCheckedDialog}
                onClose={() => setOpenClearCheckedDialog(false)}
                aria-labelledby="clear-checked-dialog-title"
            >
                <DialogTitle id="clear-checked-dialog-title">
                    {dictionary.confirm_clear_checked}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenClearCheckedDialog(false)}>
                        {dictionary.cancel_btn}
                    </Button>
                    <Button onClick={clearCheckedItems} color="error" autoFocus>
                        {dictionary.confirm_btn}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}