import { useState } from 'react';
import { fetchStudentById } from '@/services/studentService';
import { isValidStudentId } from '../../../../utils/validator';

export function useStudentLookup() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lookup = async (idNo) => {
        if (!isValidStudentId(idNo)) {
            setError('Invalid ID format (YYYY-X-XXXXX)');
            setStudent(null);
            return null;
        }

        try {
            setLoading(true);
            setError('');
            const data = await fetchStudentById(idNo);
            if (!data) throw new Error();
            setStudent(data);
            return data;
        } catch {
            setError('User not found.');
            setStudent(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { student, loading, error, lookup };
}
