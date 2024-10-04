"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { Avatar } from "@nextui-org/avatar";
import NextLink from "next/link";
import { useState, useEffect, useReducer } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@nextui-org/skeleton";

import { ThemeSwitch } from "@/components/theme-switch";
import { SpotifyLogo, SearchIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { BASE_URL, fetchWithToken, LOGIN_URL } from "@/api/auth";

export const Navbar = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useReducer(
    (current: any) => !current,
    false,
  );
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const data = await fetchWithToken(false, `${BASE_URL}/profile/`);

          setProfile(data);
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    await logout();
    setProfile(null);
    router.push("/");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsMenuOpen();
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search album..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
    />
  );

  return (
    <>
      <NextUINavbar
        isMenuOpen={isMenuOpen}
        maxWidth="xl"
        position="sticky"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-1"
              href="/"
            >
              <p className="font-bold text-inherit">MBA.</p>
            </NextLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex" justify="center">
          <NavbarItem className="hidden sm:flex">
            {isAuthenticated && pathname !== "/search" ? searchInput : null}
          </NavbarItem>
        </NavbarContent>

        <NavbarContent
          className="hidden sm:flex basis-1/5 sm:basis-full"
          justify="end"
        >
          <NavbarItem className="hidden md:flex">
            <ThemeSwitch />
          </NavbarItem>

          {isLoading ? (
            <NavbarItem className="hidden md:flex">
              <Skeleton className="r-full" />
            </NavbarItem>
          ) : isAuthenticated && profile ? (
            <Dropdown backdrop="blur" placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  src={profile.img_profile_url}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold underline text-lg">
                    {profile.user?.first_name || profile.user?.username}
                  </p>
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  onClick={() => {
                    router.push("/profile");
                  }}
                >
                  <Link color="foreground" href="/profile">
                    My Profile
                  </Link>
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : null}
        </NavbarContent>
        {isLoading ? null : !isAuthenticated ? (
          <Button
            className="text-sm font-normal text-default-600 bg-default-100 flex"
            startContent={<SpotifyLogo className="text-green-500" />}
            variant="flat"
            onPress={() => {
              window.location.href = `${LOGIN_URL}`;
            }}
          >
            Sign in / Sign up
          </Button>
        ) : null}
        <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
          <ThemeSwitch />
          {isAuthenticated ? <NavbarMenuToggle /> : null}
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-4">
            {isAuthenticated && pathname !== "/search" ? (
              <NavbarMenuItem>
                {searchInput}

                <Button
                  className="flex mt-2 w-full"
                  variant="flat"
                  onPress={handleSearch}
                >
                  Search
                </Button>
              </NavbarMenuItem>
            ) : null}
            <NavbarMenuItem>
              <div className="flex flex-row w-full gap-4">
                <Avatar
                  className="justify-start w-20 h-20"
                  size="lg"
                  src={profile?.img_profile_url}
                />
                <div className="flex flex-row  items-center text-center flex-1 justify-center bg-transparent bg-foreground- rounded-lg gap-1">
                  <p className="font-semibold text-2xl">
                    {profile?.user?.first_name || profile?.user?.username}
                  </p>
                </div>
              </div>
            </NavbarMenuItem>
            <Button
              as={Link}
              className="w-full"
              variant="flat"
              onPress={() => {
                router.push("/profile");
                setIsMenuOpen();
              }}
            >
              My Profile
            </Button>

            {isAuthenticated ? (
              <Button
                color="danger"
                variant="flat"
                onPress={() => {
                  handleLogout();
                  setIsMenuOpen();
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                isExternal
                as={Link}
                className="text-sm font-normal text-default-600 light:text-black"
                color="primary"
                startContent={<SpotifyLogo className="text-green-500" />}
                variant="flat"
                onPress={() => {
                  window.location.href = `${LOGIN_URL}`;
                  setIsMenuOpen();
                }}
              >
                Sign in / Sign up
              </Button>
            )}
          </div>
        </NavbarMenu>
      </NextUINavbar>
    </>
  );
};
