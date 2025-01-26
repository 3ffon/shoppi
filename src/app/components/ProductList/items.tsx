"use client"
import React, { useEffect, useCallback } from 'react'
import {
    List,
    ListItem,
    ListItemButton,
    TextField,
} from '@mui/material';

import style from './list.module.css';

import Checkbox from '@mui/material/Checkbox';
import { ApiResponseInterface, ProductInterface, SectionInterface } from '../../lib/interfaces';
import { fetchDb, updateProduct } from '../../lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

import { debounce } from 'lodash'

interface SectionProps {
    section: SectionInterface,
    items: ProductInterface[],
    search: string,
}

function Section({ ...props }: SectionProps) {
    const { search } = props;
    const [section] = React.useState(props.section);
    const [items] = React.useState(props.items);



    const filteredProducts = items.filter((product) =>
        product.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {filteredProducts.map((item) => (
                <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    <Item
                        key={item.id}
                        item={item}
                        section={section}
                    />
                </motion.div>
            ))}
        </AnimatePresence>
    )
}

function Item({ ...props }) {
    const {
        section,
    } = props;

    const [item, setItem] = React.useState(props.item);

    const updateItem = async (data: ProductInterface) => {
        setItem(data);
        await updateProduct(data.id, data);
    }

    return (
        <ListItem key={`item-${section}-${item.id}`}>
            <ListItemButton
                sx={{
                    fontWeight: 'bold',
                    display: "flex",
                    justifyContent: "space-between",
                }}
                onClick={() => {
                    const updatedItem = {
                        ...item,
                        quantity: item.quantity > 0 ? 0 : 1
                    };

                    updateItem(updatedItem);
                }}
            >
                <div style={{display: 'grid'}}>
                    {item.id}
                    <small>{section.name}</small>
                </div>
                <Checkbox
                    sx={{
                        pointerEvents: "none", // Disables interaction with the checkbox
                    }}
                    checked={item.quantity > 0}
                />
            </ListItemButton>
        </ListItem>
    );
}

export default function Items({ ...props }) {
    const { dict } = props;
    const [items, setItems] = React.useState<ApiResponseInterface>();
    const [searctInput, setSearchInput] = React.useState('');
    const [search, setSearch] = React.useState('');
    
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetSearch = useCallback(debounce(setSearch, 150), []);
    
    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        }
    }, [debouncedSetSearch]);

    useEffect(() => {
        fetchDb().then(response => setItems(response));
    }, []);

    return (
        <div className={style.list_wrapper}>
            <TextField
                id="item-search"
                label={dict.main.search_input}
                variant="outlined"
                className={style.search}
                value={searctInput}
                onChange={e => {
                    setSearchInput(e.target.value);
                    debouncedSetSearch(e.target.value);
                }}
            />
            <List
                className={style.list}
                subheader={<li />}
            >

                {items?.sections.map((section) => (
                    <li key={`section-${section.id}`}>
                        <Section section={section} items={items.itemsGrouped[section.id]} search={search} />
                    </li>
                ))}
            </List>
        </div>
    );
}