ModuleNemeaBundle
========================

Bundle with custom rendering of modules for [NetopeerGUI](https://github.com/CESNET/Netopeer-GUI).

## Installation

### Step 1.
Edit composer.json, add following

		"repositories":
    [
        {
            "type": "vcs",
            "url": "https://github.com/CESNET/Netopeer-GUI-module-nemea"
        }
    ],

Add bundle into app using composer:

	php composer.phar require cesnet/module-nemea-bundle "dev-master"

### Step 2.
Enable the bundle in the kernel:

	<?php
	// app/AppKernel.php

	public function registerBundles()
	{
	    $bundles = array(
	        // ...
	        new FIT\Bundle\ModuleNemeaBundle\FITModuleNemeaBundle(),
	    );
	}

### Step 3.
Enable the bundle for custom module name in DB, just like that:

	INSERT INTO "ModuleController" ("id", "moduleName", "moduleNamespace", "controllerActions") VALUES (,	'nacm',	'urn:ietf:params:xml:ns:yang:ietf-netconf-acm',	'FIT\Bundle\ModuleNemeaBundle\Controller\ModuleController::moduleAction');

It is necessary to do this by hand, because no administration or command is created yet.
