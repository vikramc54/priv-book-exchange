import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Axios from 'axios';
import Cookie from "universal-cookie";
const cookies = new Cookie();

function Register() {
    const [ registerType, changeRegisterType ] = useState("User");

    const history = useHistory();

    const RegisterSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        username: Yup.string().required("Username is Required").matches(/^[a-zA-Z0-9_]*$/, "username can only contain these [a-zA-Z0-9_]")
            .test("usernameValid", "Username exists", async (value) => {
                var exists;
                if(registerType === "User") {
                    await Axios.get(`http://localhost:8000/api/users/${value}`).then((res) => {
                        exists = !res.data.err;
                })}
                else {
                    await Axios.get(`http://localhost:8000/api/delivery-users/${value}`).then((res) => {
                        exists = !res.data.err;
                })}
                return exists;
            }),
        email: Yup.string().email("Invalid Email").required("Email is Required"),
        password: Yup.string().required("Password is Required")
            .matches(/^[a-zA-Z0-9_]*$/, "password can only contain these [a-zA-Z0-9_]").min(8, "Password too short"),
        password_confirm: Yup.string().oneOf([Yup.ref('password')], "Passwords must match").required("Passwords must match"),
        city: Yup.string(),
        address: Yup.string().min(10, "Address too short")
    });

    useEffect(() => {
        console.log("registering");
        if(cookies.get("auth").auth) {
            history.push("/");
        }
    }, []);

    const finishRegister = (values) => {
        console.log("submitting");
        console.log(values);
        const url = registerType === "User" ? "user" : "delivery-user";

        Axios.post(`http://localhost:8000/api/${url}s`, {...values, status: 1}).then(async (res) => {
            console.log(res);
            await cookies.set("auth", {
                auth: true, 
                type: url, 
                user: values.username
            });
            history.push("/");
        });
    }

    
    return (
        <div>
            <h1>Register as {registerType}</h1>
            <Formik 
                initialValues = {{
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    password_confirm: '',
                    city: 'Bangalore',
                    address: ''
                }}
                validationSchema = {RegisterSchema}
                onSubmit = {(values) => finishRegister(values)}
            >
            {({errors, touched}) => (
                <Form>
                    <label>Name:<Field name="name" /></label>
                    {errors.name && touched.name ? (
                        <div>{errors.name}</div>
                    ) : <br></br>}
                    <label>Username:<Field name="username" /></label>
                    {errors.username && touched.username ? (
                        <div>{errors.username}</div>
                    ) : <br></br>}
                    <label>E-mail:<Field name="email" /></label>
                    {errors.email && touched.email ? (
                        <div>{errors.email}</div>
                    ) : <br></br>}
                    <label>Password:<Field name="password" type="password" /></label>
                    {errors.password && touched.password ? (
                        <div>{errors.password}</div>
                    ) : <br></br>}
                    <label>Confirm Password:<Field name="password_confirm" type="password" /></label>
                    {errors.password_confirm && touched.password_confirm ? (
                        <div>{errors.password_confirm}</div>
                    ) : <br></br>}
                    <label>City:<Field as="select" name="city">
                        <option value="Bangalore">Bangalore</option>
                        <option value="New Delhi">New Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                    </Field>
                    </label>
                    {errors.city && touched.city ? (
                        <div>{errors.city}</div>
                    ) : <br></br>}

                    { registerType === "User" ? (
                        <div>
                            <label>Address:<Field name="address" /></label>
                            {errors.address && touched.address ? (
                                <div>{errors.address}</div>
                            ) : <br></br>}
                        </div>
                    ) : (
                        <div></div>
                    ) }
                    
                    <button type="submit">Register</button>
                </Form>
            )}
            </Formik>
            { registerType === "User" ? (
                <div><button onClick={(e) => {changeRegisterType("Delivery User")}}>Register to deliver</button></div>
                ) : (
                <div><button onClick={(e) => {changeRegisterType("User")}}>Register to exchange books</button></div>
                )}
        </div>
    )
}

export default Register
