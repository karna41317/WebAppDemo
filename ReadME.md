Node.js installation in Windows 2008 R2 Server

Node.js is a standalone engine used for creating JavaScript based web applications. It is a run-time environment and library built with V8 which is Google’s open source, high performance JavaScript engine. Many Node.js applications function as a web stack wherein any traffic to or from the internet at large is piped through a proxy of some kind, such as Nginx or IIS.


Step :1 -- IIS Installation

	You need to install IIS Server Manager > Roles > IIS (where IIS role includes Basic Authentication, Windows Authentication, Non-HTTP Activation and HTTP Activation).

Step :2 -- NODE.JS installation

	Download Node.js from http://nodejs.org/download/ and install it. You can download “Windows Installer (.msi)” 64-bit installer for Windows 2008 R2 server.

	Now, simply open up Windows Explorer, navigate to “C:\Program Files\” and copy the folder called “nodejs”. After that, paste the folder into “C:\Program Files (x86)\” to avoid 32-bit/64-bit confusion.


IISNode installtion: 

Step :3 -- Installing IISNode.

	To do this, head over to the Github repository for IISNode and scroll down through the README file until you see “Installing for IIS 7.x/8.x”. Select x64 from the provided links. “https://github.com/tjanczuk/iisnode”
	Once the downloading is completed, you can simply double click on the installer (.exe) and proceed with IISNode installation. There is no custom setup or configuration required for this.
	Now you have successfully completed Node.js’s installation. You can verify whether it is installed correctly or not, by creating a test Node.js site.

	Follow these steps to check this.

	 Make sure you have “Default Web Site” in your IIS, if not create it from IIS by right clicking on the Site > Create a new Site.
	 From the administrative command prompt, run this command.

				 ++++++++++++++++
				%programfiles%\iisnode\setupsamples.bat
				+++++++++++++++++


				C:\>cd “Program Files\iisnode”

				C:\Program Files\iisnode>setupsamples.bat
					Installation of Node.js samples for IIS 7

				This script must be run with administrative privileges.

				This installer will perform the following tasks:

				ensure that the IIS_IUSRS group has read and write rights to “C:\Program Files\iisnode\www”
				delete the “Default Web Site/node” web application if it exists
				add a new site “Default Web Site/node” to IIS with physical path pointing to “C:\Program Files\iisnode\www”
				This script does not provide means to revert these actions. If something fails in the middle…. well, although I hate sounding negative; you are on your own.

				Press ENTER to continue or Ctrl-C to terminate.
				Press any key to continue . . .
				Ensuring IIS_IUSRS group has full permissions for “C:\Program Files\iisnode\www”
				…
				processed file: C:\Program Files\iisnode\www
				Successfully processed 1 files; Failed processing 0 files
				…success
				Ensuring the “Default Web Site/node” is removed if it exists…
				ERROR ( message:Must use exact identifier for APP object with verb DELETE. )
				…success
				Creating IIS site “Default Web Site/node” with node.js samples…
				APP object “Default Web Site/node” added
				VDIR object “Default Web Site/node” added
				…success
				INSTALLATION SUCCESSFUL. Check out the samples at http://localhost/node.
				Press any key to continue . . .
				C:\Program Files\iisnode>

	Now, you can see that the new sub-site has been added under the “Default Web Site”.

	To verify this, go the “http://localhost/node/”

Step :4 -- URL rewrite Extension:

	follow the link below and install extension
	http://www.iis.net/downloads/microsoft/url-rewrite


	change the production urls in tincan and liberonline server files

	

