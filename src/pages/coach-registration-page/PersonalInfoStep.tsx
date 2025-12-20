import React from 'react';
import PersonalInfoStepBase from '../field-owner-registration-page/PersonalInfoStep';
import type { CreateCoachRegistrationPayload } from '@/features/coach-registration';

interface PersonalInfoStepProps {
    formData: CreateCoachRegistrationPayload;
    updateFormData: (data: Partial<CreateCoachRegistrationPayload>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, updateFormData }) => {
    return (
        <PersonalInfoStepBase
            formData={formData as any}
            onFormDataChange={(data) => updateFormData(data as any)}
        />
    );
};

export default PersonalInfoStep;
