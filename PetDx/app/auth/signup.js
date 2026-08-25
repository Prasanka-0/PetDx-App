import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
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
import { signupSchema } from '../../utils/validation';

export default function SignupScreen() {

  const { signUp, logout } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  const onSubmit = async (data) => {
    try {

      setLoading(true);

      await signUp(data.email, data.password);
      await logout();

      Alert.alert(
        'Success',
        'Account created successfully! Please login.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );

    } catch (error) {

      Alert.alert('Signup Failed', error.message || 'Could not create account');

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

<Text style={styles.title}>Create Account</Text>

<Text style={styles.subtitle}>
Join PetDx and start detecting pets
</Text>

</LinearGradient>

{/* FORM CARD */}

<View style={styles.formCard}>

<Text style={styles.formTitle}>
Sign Up
</Text>

<Text style={styles.formSubtitle}>
Create your PetDx account
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

{/* CONFIRM PASSWORD */}

<Controller
control={control}
name="confirmPassword"
render={({ field: { onChange, value } }) => (
<CustomInput
label="Confirm Password"
icon="lock-closed-outline"
placeholder="Confirm your password"
secureTextEntry={!showConfirmPassword}
value={value}
onChangeText={onChange}
error={errors.confirmPassword?.message}
showPasswordToggle
onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
/>
)}
/>

{/* SIGNUP BUTTON */}

<CustomButton
title="Create Account"
onPress={handleSubmit(onSubmit)}
loading={loading}
variant="primary"
size="large"
/>

{/* LOGIN LINK */}

<View style={styles.loginContainer}>

<Text style={styles.loginText}>
Already have an account?
</Text>

<TouchableOpacity
onPress={() => router.push('/auth/login')}
>

<Text style={styles.loginLink}>
Sign In
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

loadingContainer:{
flex:1,
justifyContent:'center',
alignItems:'center'
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
fontSize:30,
fontWeight:'bold',
color:'#fff',
marginTop:10
},

subtitle:{
fontSize:14,
color:'rgba(255,255,255,0.9)',
marginTop:4
},

formCard:{
flex:1,
backgroundColor:'#fff',
marginHorizontal:20,
marginTop:-40,
marginBottom:80,
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

loginContainer:{
flexDirection:'row',
justifyContent:'center',
marginTop:25
},

loginText:{
color:'#888',
fontSize:15
},

loginLink:{
color:'#6B4EFF',
fontSize:15,
fontWeight:'600',
marginLeft:6
}

});
