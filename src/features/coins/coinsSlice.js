import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
const COINGECKO_MARKETS = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';
const COINGECKO_DETAILS = (id) => `https://api.coingecko.com/api/v3/coins/${id}?localization=false&market_data=true`;
const selectedFromStorage = () => {
    try {
        const stored = window.localStorage.getItem('crypto-selected');
        return stored ? JSON.parse(stored) : [];
    }
    catch {
        return [];
    }
};
const saveSelection = (ids) => {
    try {
        window.localStorage.setItem('crypto-selected', JSON.stringify(ids));
    }
    catch {
        // ignore storage errors
    }
};
export const fetchCoinList = createAsyncThunk('coins/fetchList', async () => {
    const response = await fetch(COINGECKO_MARKETS);
    if (!response.ok) {
        throw new Error('Unable to load coin list');
    }
    return (await response.json());
});
export const fetchCoinDetails = createAsyncThunk('coins/fetchDetails', async (coinId) => {
    const response = await fetch(COINGECKO_DETAILS(coinId));
    if (!response.ok) {
        throw new Error('Unable to load coin details');
    }
    return (await response.json());
});
const initialState = {
    list: [],
    status: 'idle',
    details: {},
    selection: {
        selectedIds: selectedFromStorage(),
        searchQuery: '',
        pendingSelectionId: undefined,
        isSelectionDialogOpen: false
    }
};
const coinsSlice = createSlice({
    name: 'coins',
    initialState,
    reducers: {
        setSearchQuery(state, action) {
            state.selection.searchQuery = action.payload;
        },
        toggleCoinSelection(state, action) {
            const id = action.payload;
            const current = state.selection.selectedIds;
            const index = current.indexOf(id);
            if (index >= 0) {
                state.selection.selectedIds = current.filter((coinId) => coinId !== id);
                saveSelection(state.selection.selectedIds);
                return;
            }
            if (current.length >= 5) {
                state.selection.pendingSelectionId = id;
                state.selection.isSelectionDialogOpen = true;
                return;
            }
            state.selection.selectedIds = [...current, id];
            saveSelection(state.selection.selectedIds);
        },
        confirmSelectionSwap(state, action) {
            const removeId = action.payload;
            const pending = state.selection.pendingSelectionId;
            if (!pending) {
                state.selection.isSelectionDialogOpen = false;
                state.selection.pendingSelectionId = undefined;
                return;
            }
            state.selection.selectedIds = state.selection.selectedIds.filter((id) => id !== removeId);
            if (!state.selection.selectedIds.includes(pending)) {
                state.selection.selectedIds.push(pending);
            }
            state.selection.pendingSelectionId = undefined;
            state.selection.isSelectionDialogOpen = false;
            saveSelection(state.selection.selectedIds);
        },
        cancelSelectionSwap(state) {
            state.selection.pendingSelectionId = undefined;
            state.selection.isSelectionDialogOpen = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoinList.pending, (state) => {
            state.status = 'loading';
            state.error = undefined;
        })
            .addCase(fetchCoinList.fulfilled, (state, action) => {
            state.status = 'idle';
            state.list = action.payload;
        })
            .addCase(fetchCoinList.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message;
        })
            .addCase(fetchCoinDetails.fulfilled, (state, action) => {
            state.details[action.payload.id] = action.payload;
        });
    }
});
export const { setSearchQuery, toggleCoinSelection, confirmSelectionSwap, cancelSelectionSwap } = coinsSlice.actions;
export default coinsSlice.reducer;
