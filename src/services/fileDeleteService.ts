import axios from 'axios';

export const deleteFile = async (fileUrl: string): Promise<string> => {

    const response = await axios.delete('http://localhost:3000/upload', {
        data: {filename: fileUrl}
    });

    return response.data;
};
