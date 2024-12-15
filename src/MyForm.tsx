// MyForm.tsx
import React, {useState} from 'react';
import {Form, Input, Upload, Button, message, UploadFile} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import {UploadRequestError, UploadRequestOption} from 'rc-upload/lib/interface';
import {uploadFile} from './services/fileUploadService';
import axios from "axios";
import {deleteFile} from "./services/fileDeleteService.ts";

const MyForm: React.FC = () => {
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [slides, setSlides] = useState<string[]>([]);

    const handleImageUpload = async (options: UploadRequestOption) => {
        const {file, onSuccess, onError} = options;

        try {
            const url = await uploadFile(file as File);
            setImageUrl(url);
            message.success('Изображение успешно загружено');
            onSuccess?.(url);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                onError?.(error as UploadRequestError);
                message.error(`Ошибка при загрузке файла: ${error.response?.data?.message || error.message}`);
            } else if (error instanceof Error) {
                onError?.(error as UploadRequestError);
                message.error(`Произошла неизвестная ошибка: ${error.message}`);
            } else {
                const defaultError = new Error('Произошла неизвестная ошибка') as UploadRequestError;
                onError?.(defaultError);
                message.error('Произошла неизвестная ошибка');
            }
        }

    };

    const handleSlidesUpload = async (options: UploadRequestOption) => {
        const {file, onSuccess, onError} = options;

        try {
            const url = await uploadFile(file as File);
            setSlides((prevSlides) => [...prevSlides, url]);
            message.success('Слайд успешно загружен');
            onSuccess?.(url);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Приводим error к типу UploadRequestError
                onError?.(error as UploadRequestError);
                message.error(`Ошибка при загрузке файла: ${error.response?.data?.message || error.message}`);
            } else if (error instanceof Error) {
                onError?.(error as UploadRequestError);
                message.error(`Произошла неизвестная ошибка: ${error.message}`);
            } else {
                const defaultError = new Error('Произошла неизвестная ошибка') as UploadRequestError;
                onError?.(defaultError);
                message.error('Произошла неизвестная ошибка');
            }
        }

    };

    const handleSlidesRemove = async (file: UploadFile) => {
        console.log(slides)
        console.log(file.response)
        if (!file.response) {
            message.error('URL файла отсутствует');
            return;
        }

        // Отправляем запрос на сервер для удаления конкретного файла
        await deleteFile(file.response); // передаем URL конкретного файла для удаления

        // Обновляем локальное состояние слайдов, удаляя нужный файл
        setSlides((prevSlides) => prevSlides.filter((url) => url !== file.url));

        // Показать сообщение об успешном удалении
        message.info('Слайд удален');
    };

    const onFinish = (values: { title: string; description?: string }) => {
        const payload = {
            ...values,
            imageUrl,
            slides,
        };
        console.log('Отправка данных:', payload);
    };

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
                label="Название"
                name="title"
                rules={[{required: true, message: 'Введите название'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item label="Описание" name="description">
                <Input.TextArea/>
            </Form.Item>

            <Form.Item label="Картинка">
                <Upload
                    customRequest={handleImageUpload}
                    listType="picture"
                    maxCount={1}
                    onRemove={() => setImageUrl(null)}
                >
                    <Button icon={<UploadOutlined/>}>Загрузить картинку</Button>
                </Upload>
            </Form.Item>

            <Form.Item label="Слайды">
                <Upload
                    customRequest={handleSlidesUpload}
                    listType="picture"
                    multiple
                    onRemove={handleSlidesRemove}
                >
                    <Button icon={<UploadOutlined/>}>Загрузить слайды</Button>
                </Upload>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Отправить
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MyForm;