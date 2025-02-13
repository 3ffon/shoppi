import {
    Box,
    Typography,
    TextField,
    FormControl,
    Button,
    Modal,
    MenuItem,
    Select,
    InputLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import style from "./forms.module.css";
import { useDictionary } from "../../[lang]/DictionaryProvider";
import { ProductInterface, SectionInterface } from "../../lib/interfaces";
import React from "react";
import { createProduct, createSection, updateProduct } from "../../lib/apiClient";

interface ItemFormProps {
    item: ProductInterface | undefined;
    sections: { [key: string]: SectionInterface };
    additionalOnSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    defaultValue: string;
    addItemOpen: boolean;
    setAddItemOpen: (open: boolean) => void;
}

// random id generator for new section
const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
}

export default function ItemForm({ ...props }: ItemFormProps) {
    const {
        sections,
        defaultValue,
        item,
        addItemOpen,
        setAddItemOpen,
        additionalOnSubmit
    } = props;

    const isEdit = item !== undefined;

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('onSubmit', e.currentTarget);
    
        const productId = e.currentTarget.productId.value;
        let sectionSelectorId = e.currentTarget["section-selector"].value;
        
        // if the section is new, create a new section
        if (sectionSelectorId === "new_category") {
            sectionSelectorId = generateId();
            const newSection: SectionInterface = {
                id: sectionSelectorId,
                name: e.currentTarget.section.value,
            };
            await createSection(newSection);
        }
        
        if (isEdit) {
            let dirty = false;
            if (productId !== item.id) {
                item.id = productId;
                dirty = true;
            }
            if (sectionSelectorId !== item.section) {
                item.section = sectionSelectorId;
                dirty = true;
            }
            if (dirty) {
                await updateProduct(item.id, item);
            }
        }
        else {
            const product: ProductInterface = {
                id: String(productId).trim(),
                section: sectionSelectorId,
                quantity: 0,
                created: new Date().toISOString(),
                icon: '',
                image: '',
            };
            
            await createProduct(product);
        }

        // if additionalOnSubmit is provided, call it
        if (additionalOnSubmit) {
            additionalOnSubmit(e);
        }

        setAddItemOpen(false);
    }

    const theme = useTheme();
    const { dictionary } = useDictionary();
    const [section, setSection] = React.useState<string | null>(item ? item.section : null);
    const sectionInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <Modal
            open={addItemOpen}
            onClose={() => setAddItemOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                className={`${style.item_add_form} ${theme.palette.mode}`}
                component="form"
                onSubmit={onSubmit}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEdit ?
                        dictionary.item_edit_title :
                        dictionary.item_add_title
                    }
                </Typography>
                <TextField
                    fullWidth
                    required
                    id="productId"
                    name="productId"
                    label={dictionary.product_id}
                    variant="outlined"
                    defaultValue={defaultValue.trim()}
                    autoComplete='off'
                    sx={{ mb: 2 }}
                />
                <FormControl
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                >
                    <InputLabel id="section-selector">{dictionary.section_label}</InputLabel>
                    <Select
                        id="section-selector"
                        name="section-selector"
                        label={dictionary.section_label}
                        defaultValue={item ? item.section : ""}
                        onChange={(e) => {
                            setSection(e.target.value);

                            // focus on the new section input
                            if (e.target.value === "new_category") {
                                setTimeout(() => {
                                    sectionInputRef.current?.focus();
                                }, 10);
                            }
                        }}
                    >
                        {Object.values(sections).map((section) => (
                            <MenuItem key={section.id} value={section.id}>
                                {section.name}
                            </MenuItem>
                        ))}
                        <MenuItem value="new_category">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AddIcon />
                                <span>{dictionary.section_new_title}</span>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
                {section === 'new_category' && <TextField
                    fullWidth
                    required
                    id="section"
                    name="section"
                        label={dictionary.section_new_label}
                        autoComplete="off"
                        inputRef={sectionInputRef}
                        sx={{ mb: 2 }}
                    />
                }
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setAddItemOpen(false)}
                        sx={{ flex: 1 }}
                    >{dictionary.cancel_btn}</Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ flex: 3 }}
                    >{dictionary.save_btn}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
} 