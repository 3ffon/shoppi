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
    IconButton,
    styled,
    Badge,
    badgeClasses,
    Checkbox
} from '@mui/material';

import {
    Add as AddIcon,
    Clear as ClearIcon,
    DeleteOutlined as DeleteIcon,
    Tune as TuneIcon,
} from '@mui/icons-material';

import style from './page.module.css';
import { ProductInterface, CartItemInterface } from '../lib/interfaces';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import { debounce } from 'lodash';
import { useDictionary } from '@/app/providers/DictionaryProvider';
import { useDB } from '@/app/providers/DBProvider';

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;

interface ItemProps {
    item: CartItemInterface;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    setOpenEditModal: (open: boolean) => void;
    setEditItem: (item: ProductInterface) => void;
}

function Item({ ...props }: ItemProps) {
    const {
        isDragging,
        setIsDragging,
        setOpenEditModal,
        setEditItem,
    } = props;

    const { dictionary } = useDictionary();
    const { sections, products, updateProduct, deleteProduct } = useDB();
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
            setEditItem(item);
            setOpenEditModal(true);
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

    const updateItem = async (data: ProductInterface) => {
        setItem(data);
        await updateProduct(data);
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

                        }}
                        onContextMenu={handleContextMenu}
                        onClick={(e) => {
                            if (isSwiped || isDragging) {
                                return e.stopPropagation();
                            }
                            const updatedItem = {
                                ...item,
                                quantity: item.quantity > 0 ? 0 : 1
                            };
                            updateItem(updatedItem);
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                    >
                        <div style={{ display: 'grid' }}>
                            {products[item.id].name}
                            <small>{section ? section.name : dictionary.no_section}</small>
                        </div>
                        <Checkbox
                            sx={{
                                pointerEvents: "none",
                            }}
                            checked={item.checked}
                        />
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
                        <MenuItem onClick={() => {
                            setEditItem(item);
                            setOpenEditModal(true);
                            handleContextMenuClose();
                        }}>{dictionary.edit_btn}</MenuItem>
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
                    {dictionary.dialog_delete_txt} {item.name} ?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDeleteDialog(false);
                        resetSwipeState();
                    }}>{dictionary.cancel_btn}</Button>
                    <Button onClick={async () => {
                        await deleteProduct(item);
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
    const { dictionary } = useDictionary();
    const { products, mainCart } = useDB();
    const [searctInput, setSearchInput] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [openAddItemModal, setOpenAddItemModal] = React.useState(false);
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [editItem, setEditItem] = React.useState<ProductInterface | null>(null)
    const [isDragging, setIsDragging] = React.useState(false);
    const [editedItemId, setEditedItemId] = React.useState<string | null>(null);
    const filteredProducts = Object.values(mainCart.products).filter((product: Partial<CartItemInterface>) => {
        return products[product.id as string]?.name?.toLowerCase().includes(search.toLowerCase());
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetSearch = useCallback(debounce(setSearch, 150), []);

    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        }
    }, [debouncedSetSearch]);

    const addItem = () => {
        setOpenAddItemModal(true);
    };

    const handleAddEditProduct = (id: string) => {
        // Store current scroll position
        const scrollPosition = window.scrollY;
        setOpenAddItemModal(false);
        setSearchInput('');
        setSearch('');

        // If editing an item, set it as recently edited
        if (id) {
            setEditedItemId(id);

            setTimeout(() => {
                setEditedItemId(null);
            }, 1000); // Clear the edited state after 1 second
        }

        // Restore scroll position after state updates
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition);
        });
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
                <IconButton className={style.tune_button}>
                    <TuneIcon sx={{ fontSize: 30 }} />
                    <CartBadge badgeContent={2} color="primary" overlap="circular" />
                </IconButton>
            </div>

            <div className={style.list_wrapper}>
                <List
                    className={style.list}
                    subheader={<li />}
                    dense
                >
                    <AnimatePresence mode="sync">
                        {filteredProducts?.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    backgroundColor: editedItemId === item.id ?
                                        ['rgba(144, 202, 249, 0.5)', 'rgba(144, 202, 249, 0)'] :
                                        'transparent'
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
                                    setOpenEditModal={setOpenEditModal}
                                    setEditItem={setEditItem}
                                    isDragging={isDragging}
                                    setIsDragging={setIsDragging}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </List>
            </div>
        </div>
    );
}