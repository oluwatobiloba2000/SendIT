import { Image } from 'antd';
import React, { useState } from 'react'
import './photoUploader.css';

function PhotoUploader({ onChange }) {
    const [preview, setFormValues] = useState();
    const [fileDetails, setFilesDetails] = useState();
    const [uploadInputValue, setUploadInputValue] = useState();

    const handleUploadImage = (e) => {
        e.preventDefault();
        if (e.target.files[0]) {
            const reader = new FileReader();
            const file = e.target.files[0]
            reader.onloadend = () => {
                onChange(file)
                setFilesDetails(file);
                setFormValues(reader.result);
            }

            reader.readAsDataURL(file)
        }
    }




    return (
        <>
            <div className="uploader_container">
                <div>
                    <input type="file" id="uploader_input" value={uploadInputValue} className="uploader_input" accept="image/x-png,image/gif,image/jpeg" onChange={(e) => {
                        handleUploadImage(e)
                    }} />
                    <p className="upload-drag-icon">
                        <svg className="uploader_svg" width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 57.7658C0 58.6035 0.642944 59.2814 1.4375 59.2814H7.94556V66.1419C7.94556 66.9797 8.5885 67.6576 9.38306 67.6576H67.5625C68.3571 67.6576 69 66.9797 69 66.1419V9.88443C69 9.04667 68.3571 8.36876 67.5625 8.36876H61.0544V1.51567C61.0544 0.677908 60.4115 0 59.6169 0H1.4375C0.642944 0 0 0.677908 0 1.51567V57.7658ZM66.125 64.6263H10.8206V11.4001H59.5891C59.599 11.4003 59.607 11.406 59.6169 11.406C59.6269 11.406 59.6349 11.4003 59.6448 11.4001H66.125V64.6263ZM2.875 3.03134H58.1794V8.36876H9.38306C8.5885 8.36876 7.94556 9.04667 7.94556 9.88443V56.2501H2.875V3.03134Z" fill="#F77F00" /><path d="M15.1328 14.4315C14.3383 14.4315 13.6953 15.1094 13.6953 15.9471V54.8513C13.6953 55.0486 13.7334 55.2451 13.806 55.4303C13.9516 55.8013 14.2318 56.0968 14.5837 56.2503C14.7594 56.3269 14.9458 56.367 15.1328 56.367H61.8123C61.8125 56.367 61.8127 56.3668 61.813 56.3668C61.8132 56.3668 61.8134 56.367 61.8137 56.367C61.9867 56.367 62.1578 56.3253 62.3233 56.2583C62.385 56.2334 62.4361 56.195 62.4933 56.1618C62.5597 56.1234 62.6309 56.0994 62.6924 56.0488C62.716 56.0296 62.7263 56.001 62.7483 55.9807C62.8264 55.9088 62.8863 55.825 62.9481 55.7369C62.9996 55.6634 63.053 55.5951 63.0904 55.5143C63.1301 55.4298 63.1499 55.3391 63.1742 55.2465C63.2006 55.1455 63.226 55.0487 63.232 54.9441C63.234 54.9117 63.2498 54.8843 63.2498 54.8513V15.9471C63.2498 15.1094 62.6068 14.4315 61.8123 14.4315H15.1328ZM60.3748 17.4628V50.4224L48.3525 34.0656C48.1041 33.7252 47.7292 33.5135 47.3221 33.4824C46.9108 33.4484 46.515 33.6023 46.2216 33.8998L34.8881 45.372L30.0202 39.329C29.7605 39.0064 29.3843 38.8125 28.9842 38.7962C28.5869 38.7695 28.1924 38.9383 27.9089 39.2387L16.5703 51.1927V17.4628H60.3748ZM41.3031 53.3357L36.753 47.687L47.0596 37.2539L58.8803 53.3357H41.3031ZM37.5323 53.3357H18.6033L28.8396 42.5439L37.5323 53.3357Z" fill="#F77F00" /><path d="M33.1646 34.5467C36.2543 34.5467 38.7686 31.8957 38.7686 28.6379C38.7686 25.3801 36.2543 22.7292 33.1646 22.7292C30.0748 22.7292 27.5605 25.3801 27.5605 28.6379C27.5605 31.8957 30.0748 34.5467 33.1646 34.5467ZM33.1646 25.7605C34.6694 25.7605 35.8936 27.0512 35.8936 28.6379C35.8936 30.2247 34.6694 31.5153 33.1646 31.5153C31.6597 31.5153 30.4355 30.2247 30.4355 28.6379C30.4355 27.0512 31.6597 25.7605 33.1646 25.7605Z" fill="#F77F00" /></svg>
                    </p>
                    <p className="upload-text">Click this area to upload</p>
                    <p className="upload-hint">
                        must be .jpg and .png file, smaller than 2mb and at least
                </p>
                 {fileDetails && <p className="upload_file_name" >{fileDetails.name}</p>}
                </div>

                {preview && <div className="uploader_preview">
                    <svg onClick={() => {
                        onChange(null)
                        setFormValues(null);
                        setFilesDetails(null);
                        setUploadInputValue('');
                    }} className="w-6 h-6 close_uploader_preview" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <Image src={preview} />
                </div>}
            </div>
        </>
    )
}

export default PhotoUploader;
