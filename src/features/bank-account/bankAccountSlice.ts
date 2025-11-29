import { createSlice } from "@reduxjs/toolkit";
import {
    addBankAccount,
    getMyBankAccounts,
    validateBankAccount,
    type BankAccountResponse,
    type BankAccountValidationResponse,
} from "./bankAccountThunk";

interface BankAccountState {
    accounts: BankAccountResponse[];
    validationResult: BankAccountValidationResponse | null;
    loading: boolean;
    adding: boolean;
    validating: boolean;
    error: string | null;
}

const initialState: BankAccountState = {
    accounts: [],
    validationResult: null,
    loading: false,
    adding: false,
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
    },
});

export const { clearError, clearValidationResult } = bankAccountSlice.actions;
export default bankAccountSlice.reducer;

