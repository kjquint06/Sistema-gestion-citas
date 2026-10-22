<?php

test('home redirects to login', function () {
    $this->get(route('home'))->assertRedirect('/login');
});
