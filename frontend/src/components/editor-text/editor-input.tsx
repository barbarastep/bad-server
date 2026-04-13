import { ChangeEvent } from 'react'
import './editor-input.scss'

type EditorInputProps = {
    value: string
    onChange: (value: string) => void
}

export default function EditorInput({ onChange, value }: EditorInputProps) {
    function handleChangeElement(e: ChangeEvent<HTMLTextAreaElement>) {
        onChange(e.target.value)
    }

    return (
        <div className='customEditor'>
            <textarea
                className='rsw-editor'
                value={value}
                onChange={handleChangeElement}
                maxLength={1000}
                placeholder='Комментарий к заказу'
            />
        </div>
    )
}
