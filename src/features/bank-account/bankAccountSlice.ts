import { createSlice } from "@reduxjs/toolkit";
import {
    addBankAccount,
    getMyBankAccounts,
    validateBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,
    type BankAccountResponse,
    type BankAccountValidationResponse,
} from "./bankAccountThunk";

interface BankAccountState {
    accounts: BankAccountResponse[];
    validationResult: BankAccountValidationResponse | null;
    loading: boolean;
    adding: boolean;
    updating: boolean;
    deleting: boolean;
    validating: boolean;
    error: string | null;
}

const initialState: BankAccountState = {
    accounts: [],
    validationResult: null,
    loading: false,
    adding: false,
    updating: false,
    deleting: false,
    validating: false,
    error: null,
};

const bankAccountSlice = createSlice({
    name: "bankAccount",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearValidationResult: (state) => {
            state.validationResult = null;
        },
    },
    extraReducers: (builder) => {
        // Add bank account
        builder
            .addCase(addBankAccount.pending, (state) => {
                state.adding = true;
                state.error = null;
            })
            .addCase(addBankAccount.fulfilled, (state, action) => {
                state.adding = false;
                state.accounts.unshift(action.payload);
                state.error = null;
            })
            .addCase(addBankAccount.rejected, (state, action) => {
                state.adding = false;
                state.error = action.payload?.message || "Failed to add bank account";
            });

        // Get my bank accounts
        builder
            .addCase(getMyBankAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyBankAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload;
                state.error = null;
            })
            .addCase(getMyBankAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get bank accounts";
            });

        // Validate bank account
        builder
            .addCase(validateBankAccount.pending, (state) => {
                state.validating = true;
                state.error = null;
            })
            .addCase(validateBankAccount.fulfilled, (state, action) => {
                state.validating = false;
                state.validationResult = action.payload;
                state.error = null;
            })
            .addCase(validateBankAccount.rejected, (state, action) => {
                state.validating = false;
                state.error = action.payload?.message || "Failed to validate bank account";
            });

        // Update bank account
        builder
            .addCase(updateBankAccount.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateBankAccount.fulfilled, (state, action) => {
                state.updating = false;
                const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
                if (index !== -1) {
                    state.accounts[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateBankAccount.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to update bank account";
            });

        // Delete bank account
        builder
            .addCase(deleteBankAccount.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteBankAccount.fulfilled, (state, action) => {
                state.deleting = false;
                state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteBankAccount.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload?.message || "Failed to delete bank account";
            });

        // Set default bank account
        builder
            .addCase(setDefaultBankAccount.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(setDefaultBankAccount.fulfilled, (state, action) => {
                state.updating = false;
                // Update all accounts: set the target account as default, others as false
                state.accounts = state.accounts.map((acc) => ({
                    ...acc,
                    isDefault: acc.id === action.payload.id,
                }));
                // Update the account details if it exists, otherwise add it
                const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
                if (index !== -1) {
                    state.accounts[index] = action.payload;
                } else {
                    state.accounts.push(action.payload);
                }
                state.error = null;
            })
            .addCase(setDefaultBankAccount.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload?.message || "Failed to set default bank account";
            });
    },
});

export const { clearError, clearValidationResult } = bankAccountSlice.actions;
export default bankAccountSlice.reducer;

