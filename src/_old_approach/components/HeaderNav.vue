<template>
  <div class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <Menu class="h-5 w-5" />
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><router-link to="/learning-goals">Learning Goals</router-link></li>
          <li><router-link to="/units-of-meaning">Units of Meaning</router-link></li>
          <li><router-link to="/user-settings">Settings</router-link></li>
        </ul>
      </div>
      <router-link to="/learning-goals" class="btn btn-ghost text-xl">LinguaNodon</router-link>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><router-link to="/learning-goals" class="link link-hover">Learning Goals</router-link></li>
        <li><router-link to="/units-of-meaning" class="link link-hover">Units of Meaning</router-link></li>
        <li><router-link to="/user-settings" class="link link-hover">Settings</router-link></li>
      </ul>
    </div>
    <div class="navbar-end">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <Settings class="h-5 w-5" />
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><router-link to="/user-settings">User Settings</router-link></li>
          <li><router-link to="/debug/learning-goals">Debug Learning Goals</router-link></li>
          <li><router-link to="/debug/units-of-meaning">Debug Units of Meaning</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, Settings } from 'lucide-vue-next'
</script> 