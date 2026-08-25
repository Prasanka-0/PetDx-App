import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';

import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../context/AuthContext';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { loginSchema } from '../../utils/validation';

export default function LoginScreen() {

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (

<KeyboardAvoidingView
style={styles.container}
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>

<ScrollView
contentContainerStyle={styles.scrollContent}
showsVerticalScrollIndicator={false}
>

{/* HEADER */}

<LinearGradient
colors={['#6B4EFF', '#8B6EFF']}
style={styles.header}
>

<TouchableOpacity
style={styles.backButton}
onPress={() => router.back()}
>
<Ionicons name="arrow-back" size={24} color="#fff" />
</TouchableOpacity>

<Ionicons name="paw" size={70} color="#fff" />

<Text style={styles.title}>PetDx</Text>

<Text style={styles.subtitle}>
AI Pet Breed & Disease Detection
</Text>

</LinearGradient>

{/* FORM CARD */}

<View style={styles.formCard}>

<Text style={styles.formTitle}>
Welcome Back
</Text>

<Text style={styles.formSubtitle}>
Sign in to continue
</Text>

{/* EMAIL */}

<Controller
control={control}
name="email"
render={({ field: { onChange, value } }) => (
<CustomInput
label="Email"
icon="mail-outline"
placeholder="Enter your email"
keyboardType="email-address"
autoCapitalize="none"
value={value}
onChangeText={onChange}
error={errors.email?.message}
/>
)}
/>

{/* PASSWORD */}

<Controller
control={control}
name="password"
render={({ field: { onChange, value } }) => (
<CustomInput
label="Password"
icon="lock-closed-outline"
placeholder="Enter your password"
secureTextEntry={!showPassword}
value={value}
onChangeText={onChange}
error={errors.password?.message}
showPasswordToggle
onTogglePassword={() => setShowPassword(!showPassword)}
/>
)}
/>

{/* FORGOT PASSWORD */}

<TouchableOpacity
style={styles.forgotPassword}
onPress={() => router.push('/auth/reset-password')}
>
<Text style={styles.forgotPasswordText}>
Forgot Password?
</Text>
</TouchableOpacity>

{/* LOGIN BUTTON */}

<CustomButton
title="Sign In"
onPress={handleSubmit(onSubmit)}
loading={loading}
variant="primary"
size="large"
/>

{/* SIGNUP */}

<View style={styles.signupContainer}>

<Text style={styles.signupText}>
Don't have an account?
</Text>

<TouchableOpacity
onPress={() => router.push('/auth/signup')}
>

<Text style={styles.signupLink}>
Create Account
</Text>

</TouchableOpacity>

</View>

</View>

</ScrollView>

</KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:'#F5F7FA'
},

scrollContent:{
flexGrow:1
},

header:{
height:260,
justifyContent:'center',
alignItems:'center',
borderBottomLeftRadius:40,
borderBottomRightRadius:40,
paddingTop:10
},

backButton:{
position:'absolute',
top:50,
left:20
},

title:{
fontSize:32,
fontWeight:'bold',
color:'#fff',
marginTop:10
},

subtitle:{
fontSize:14,
color:'rgba(255,255,255,0.85)',
marginTop:4
},

formCard:{
flex:1,
backgroundColor:'#fff',
marginHorizontal:20,
marginTop:-40,
marginBottom:40,
borderRadius:25,
padding:24,
shadowColor:'#000',
shadowOffset:{width:0,height:4},
shadowOpacity:0.1,
shadowRadius:10,
elevation:6
},

formTitle:{
fontSize:24,
fontWeight:'bold',
color:'#333'
},

formSubtitle:{
fontSize:14,
color:'#888',
marginBottom:20
},

forgotPassword:{
alignSelf:'flex-end',
marginBottom:20
},

forgotPasswordText:{
color:'#6B4EFF',
fontSize:14,
fontWeight:'500'
},

signupContainer:{
flexDirection:'row',
justifyContent:'center',
marginTop:25
},

signupText:{
color:'#888',
fontSize:15
},

signupLink:{
color:'#6B4EFF',
fontSize:15,
fontWeight:'600',
marginLeft:6
}

});
