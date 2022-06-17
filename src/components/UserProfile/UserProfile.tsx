import React, { useEffect, useRef, useState } from 'react'
import styles from './UserProfile.module.css'
import { Box, Button, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { tcb_app, tcb_auth } from '../../configs/global';
import useErrorMsg from '../../hooks/useErrorMsg';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectUser, updateAvatar } from '../../stores/user/userSlice';

interface Props { }

interface InputRefs {
  nickName: HTMLInputElement | null,
  file: HTMLInputElement | null,
  uploadBtn: HTMLButtonElement | null
}

const UserProfile = (props: Props) => {
  const userState = useAppSelector(selectUser)
  const [nickNameError, setNickNameError] = useErrorMsg([' ', '昵称长度为0-14个字符，包括汉字、字母、数字'])
  const [uploadProgress, setUploadProgress] = useState(false)
  const refs = useRef<InputRefs>({
    nickName: null,
    file: null,
    uploadBtn: null
  })
  const dispatch = useAppDispatch()

  function uploadAvatar() {
    refs.current.uploadBtn!.disabled = true
    setUploadProgress(true)
    // 上传头像文件
    tcb_app.uploadFile({
      cloudPath: `inno/user-avatars/${refs.current.file?.files![0].name.replace("image/", (userState as any).phone)}`,
      filePath: refs.current.file!.files![0] as unknown as string
    }).then((result: any) => {
      // 更新远程头像地址
      tcb_auth.currentUser?.update({ avatarUrl: result.download_url }).then(() => {
        // 更新本地头像状态，触发渲染新头像
        dispatch(updateAvatar(result.download_url))
        // 启用按钮
        setUploadProgress(false)
        refs.current.uploadBtn!.disabled = false
      })
    })
  }

  function updateProfile() {
    if (refs.current.nickName?.value.match(/^(?!-)[a-zA-Z0-9_\u4e00-\u9fa5]{0,14}$/g)) {
      tcb_auth.currentUser?.update({ nickName: refs.current.nickName.value })
      setNickNameError(0, false)
    } else {
      setNickNameError(1, true)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>我的资料</h1>
      <p className={styles.hero_paragraph}>你好，在这里可以对你的个人资料进行管理~</p>
      <div className={styles.content}>
        <h3>用户头像</h3>
        <div className={styles.avatar_section}>
          <img className={styles.avatar} width='128' height='128' src={userState.data?.avatarUrl !== '' ? userState.data?.avatarUrl : '/assets/icons/avatar.webp'} />
          <Button ref={ref => refs.current.uploadBtn = ref} sx={{ ml: '1rem' }} onClick={() => { refs.current.file!.click() }} variant='outlined' disableElevation>
            {uploadProgress && <CircularProgress size='16px' />}上传图片
          </Button>
          <input onChange={() => { uploadAvatar() }} ref={ref => refs.current.file = ref} hidden type='file' accept='image/jpeg,image/jpg,image/png,image/webp' />
        </div>
        <p className={styles.hero_paragraph}>上传一张图片作为头像，推荐尺寸为 256x256 px</p>
        <Box className={styles.info_section} sx={{
          '& .MuiTextField-root': {
            my: 1
          }
        }}>
          <TextField size='small' label="手机号码" value={(userState as any).phone} disabled
            sx={{ width: '290px' }} />
          <TextField inputRef={ref => refs.current.nickName = ref} error={nickNameError.status} helperText={nickNameError.msg}
            size='small' label="昵称" sx={{ width: '290px' }} defaultValue={userState.data?.nickName} />
        </Box>
        <Button variant='contained' disableElevation onClick={updateProfile}>更新资料</Button>
      </div>
    </div>
  )
}

export default UserProfile