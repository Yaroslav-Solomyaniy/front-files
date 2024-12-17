import React, { useState } from 'react';
import { Button, Form, Input, message, Upload, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import {uploadFile} from "./services/fileUploadService.ts";

const AfterUpload: React.FC = () => {
    const [form] = Form.useForm();
    const [tempImage, setTempImage] = useState<UploadFile | null>(null);
    const [tempSlides, setTempSlides] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false); // Индикатор загрузки

    const createUploadFile = (file: RcFile): UploadFile => ({
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
        url: URL.createObjectURL(file), // Временная ссылка для предпросмотра
    });

    const beforeUploadPic = (file: RcFile) => {
        setTempImage(createUploadFile(file));
        return Upload.LIST_IGNORE; // Отключить автоматическую загрузку
    };

    const beforeUploadSlides = (file: RcFile) => {
        setTempSlides((prev) => [...prev, createUploadFile(file)]);
        return Upload.LIST_IGNORE; // Отключить автоматическую загрузку
    };

    const onRemoveSlide = (file: UploadFile) => {
        setTempSlides((prev) => prev.filter((item) => item.uid !== file.uid));
    };

    const onFinish = async (values: any) => {
        setLoading(true); // Показать индикатор загрузки

        try {
            // Загрузка главной картинки (если есть)
            const imageURL = tempImage?.originFileObj
                ? await uploadFile(tempImage.originFileObj)
                : null;

            // Загрузка слайдов (если есть)
            const slidesURLs = await Promise.all(
                tempSlides.map((slide) =>
                    slide.originFileObj ? uploadFile(slide.originFileObj) : null
                )
            );

            // Отправка всей формы на сервер
            const response = await fetch('http://localhost:3000/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values, // Данные формы
                    image: imageURL, // Ссылка на главную картинку
                    slides: slidesURLs.filter(Boolean), // Ссылки на слайды
                }),
            });

            console.log(values, imageURL, slidesURLs.filter(Boolean))

            if (!response.ok) {
                throw new Error('Ошибка при отправке формы');
            }

            message.success('Форма успешно отправлена!');
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(`Ошибка: ${error.message}`);
            } else {
                message.error('Неизвестная ошибка');
            }
        } finally {
            setLoading(false); // Скрыть индикатор загрузки
        }
    };

    return (
        <Form form={form} onFinish={onFinish} layout="horizontal">
            <Form.Item label="Название" name="title" rules={[{ required: true, message: 'Введите название' }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Описание" name="description">
                <Input.TextArea />
            </Form.Item>

            <Form.Item label="Картинка">
                <Upload
                    listType="picture"
                    maxCount={1}
                    showUploadList={true}
                    beforeUpload={beforeUploadPic}
                    fileList={tempImage ? [tempImage] : []}
                >
                    <Button icon={<UploadOutlined />}>Загрузить картинку</Button>
                </Upload>
            </Form.Item>

            <Form.Item label="Слайды">
                <Upload
                    listType="picture"
                    multiple
                    showUploadList={true}
                    beforeUpload={beforeUploadSlides}
                    fileList={tempSlides}
                    onRemove={onRemoveSlide}
                >
                    <Button icon={<UploadOutlined />}>Загрузить слайды</Button>
                </Upload>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {loading ? 'Отправка...' : 'Отправить'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AfterUpload;
